'use strict';

const { Contract } = require('fabric-contract-api');

class NFTContract extends Contract {

    // Crée un nouveau NFT représentant un produit agricole
    async createNFT(ctx, id, owner, name, category, description, metadata) {
        // Vérification que le NFT n'existe pas déjà
        const existingNFT = await ctx.stub.getState(id);
        if (existingNFT && existingNFT.length > 0) {
            throw new Error(`Le NFT avec l'ID ${id} existe déjà.`);
        }

        // Création de l'objet NFT
        const nft = {
            id,                     // Identifiant unique du NFT
            owner,                  // Propriétaire actuel du NFT
            name,                   // Nom du produit agricole
            category,               // Catégorie du produit (ex. : fruits, légumes)
            description,            // Description du produit
            metadata,               // Métadonnées supplémentaires (ex. : images, spécifications)
            interactors: [owner],   // Liste des acteurs ayant interagit avec le NFT. Le premier proprietaire du NFT est initialisé comme premier interacteur
        };

        // Stockage du NFT dans la blockchain
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(nft)));
    }

    // Transfère la propriété d'un NFT à un nouveau propriétaire
    async transferNFT(ctx, id, newOwner) {
        // Récupération de l'état actuel du NFT par ID
        const nftBytes = await ctx.stub.getState(id);
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`NFT non trouvé: ${id}`);
        }

        // Conversion des bytes en objet NFT
        const nft = JSON.parse(nftBytes.toString());
        
        // Mise à jour du propriétaire du NFT
        nft.owner = newOwner;

        // Ajout du nouvel acteur propriétaire à la liste des interacteurs
        nft.interactors.push(newOwner);

        // Mise à jour de l'état du NFT dans la blockchain
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(nft)));
    }

    // Récupère un NFT par ID
    async readNFT(ctx, id) {
        // Récupération de l'état du NFT
        const nftBytes = await ctx.stub.getState(id);
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`NFT non trouvé: ${id}`);
        }

        // Retourne l'objet NFT sous forme de chaîne
        return nftBytes.toString();
    }
}

// Instanciation du chaincode
module.exports = NFTContract;