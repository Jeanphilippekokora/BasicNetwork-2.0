'use strict';

const { Contract } = require('fabric-contract-api');

class IdentityContract extends Contract {

    // Crée un nouveau document DID
    async createDID(ctx, did, publicKey, metadata, x509Cert) {
        const didDocument = {
            did,
            publicKey,
            metadata,
            x509Cert,
            createdAt: new Date().toISOString(),
        };

        const didJSON = JSON.stringify(didDocument);

        // Stocke le document DID dans l'état de la chaîne
        await ctx.stub.putState(did, Buffer.from(didJSON));
    }

    // Récupère un document DID par DID
    async readDID(ctx, did) {
        const didBytes = await ctx.stub.getState(did);
        if (!didBytes || didBytes.length === 0) {
            throw new Error(`Document DID ${did} non trouvé`);
        }

        return didBytes.toString(); // Retourne les informations du document DID sous forme de chaîne
    }

    // Met à jour le certificat X.509 dans le document DID
    async updateDID(ctx, did, x509Cert) {
        const didBytes = await ctx.stub.getState(did);
        if (!didBytes || didBytes.length === 0) {
            throw new Error(`Document DID ${did} non trouvé`);
        }

        const didDocument = JSON.parse(didBytes.toString());
        didDocument.x509Cert = x509Cert; // Met à jour le certificat X.509

        const didJSON = JSON.stringify(didDocument);
        await ctx.stub.putState(did, Buffer.from(didJSON));
    }
}

// Instanciation du chaincode
module.exports = IdentityContract;