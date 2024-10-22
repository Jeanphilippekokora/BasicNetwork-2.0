'use strict';

const { Contract } = require('fabric-contract-api');

class IdentityContract extends Contract {

    // Crée un nouveau document DID
    async createDID(ctx, did, publicKey, metadata, x509Cert) {
        const didDocument = {
            did, //identifiant unique de l'acteur
            publicKey, //clé publique associée au DID de l'acteur
            metadata, //metadonnée (autres informations) relative à l'acteur
            x509Cert, //certificat d'authentification x.509 delivré par le MSP du canal
            role, //role de l'acteur (type d'acteur)
            organisation, //organisation de l'acteur (structure ou entreprise à laquelle il appartient)
            createdAt: new Date().toISOString(),
        };

        const didJSON = JSON.stringify(didDocument);

        // Stocke le document DID dans la blockchain
        await ctx.stub.putState(did, Buffer.from(didJSON));
    }

    // Récupère un document DID par DID
    async readDID(ctx, did) {
        // Récupération des données du document DID à partir de la blockchain
        const didBytes = await ctx.stub.getState(did);
        // Si le document n'est pas trouvé, on renvoie une erreur
        if (!didBytes || didBytes.length === 0) {
            throw new Error(`Document DID ${did} non trouvé`);
        }

        return didBytes.toString(); // Sinon on retourne les informations du document DID sous forme de chaîne
    }

    // Met à jour le certificat X.509 dans le document DID
    async updateDID(ctx, did, x509Cert) {
        // Récupération du document DID existant
        const didBytes = await ctx.stub.getState(did);
        // Si le document n'est pas trouvé, renvoie une erreur
        if (!didBytes || didBytes.length === 0) {
            throw new Error(`Document DID ${did} non trouvé`);
        }

        // Transformation des données du document en objet JavaScript
        const didDocument = JSON.parse(didBytes.toString());
        didDocument.x509Cert = x509Cert; // On met à jour le certificat X.509

        // Conversion de l'objet mis à jour en chaîne JSON
        const didJSON = JSON.stringify(didDocument);
        await ctx.stub.putState(did, Buffer.from(didJSON)); //on stocke à nouveau dans la blockchain le document DID mis à jour
    }
}

// Instanciation ou deploiement du chaincode
module.exports = IdentityContract;