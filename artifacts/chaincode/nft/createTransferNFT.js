'use strict';

const { Contract } = require('fabric-contract-api');

class NFTContract extends Contract {

    // Crée un nouveau NFT représentant un produit agricole
    async createNFT(ctx, id, owner, name, category, description, metadata) {
        const nft = {
            id,
            owner,
            name,
            category,
            description,
            metadata,
            interactors: [owner], // Ajoute le propriétaire initial comme premier interacteur
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(nft))); // Stocke le NFT dans l'état de la chaîne
    }

    // Transfère la propriété d'un NFT à un nouveau propriétaire
    async transferNFT(ctx, id, newOwner) {
        const nftBytes = await ctx.stub.getState(id); // Récupère l'état du NFT par ID
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`NFT non trouvé: ${id}`);
        }

        const nft = JSON.parse(nftBytes.toString()); // Convertit les bytes en objet NFT
        nft.owner = newOwner; // Met à jour le propriétaire

        // Ajoute le nouvel propriétaire à la liste des interacteurs
        nft.interactors.push(newOwner);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(nft))); // Met à jour l'état du NFT dans la chaîne
    }

    // Récupère un NFT par ID
    async readNFT(ctx, id) {
        const nftBytes = await ctx.stub.getState(id); // Récupère l'état du NFT
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`NFT non trouvé: ${id}`);
        }

        return nftBytes.toString(); // Retourne l'objet NFT sous forme de chaîne
    }
}

// Instanciation du chaincode
module.exports = NFTContract;