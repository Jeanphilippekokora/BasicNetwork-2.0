'use strict';

const { Contract } = require('fabric-contract-api');

class CredentialContract extends Contract {

    // Émet un Verifiable Credential
    async issueCredential(ctx, credentialId, holderId, claims) {
        const credential = {
            credentialId,
            holderId,
            claims,
            issuedAt: new Date().toISOString(),
            status: 'active', // État initial
        };

        // Vérifie si le credential existe déjà
        const existingCredential = await ctx.stub.getState(credentialId);
        if (existingCredential && existingCredential.length > 0) {
            throw new Error(`Credential déjà existant: ${credentialId}`);
        }

        // Stocke le credential dans l'état de la chaîne
        await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));
    }

    // Récuperation d'un Verifiable Credential par ID
    async readCredential(ctx, credentialId) {
        const credentialBytes = await ctx.stub.getState(credentialId);
        if (!credentialBytes || credentialBytes.length === 0) {
            throw new Error(`Credential non trouvé: ${credentialId}`);
        }

        return credentialBytes.toString();
    }

    // Révoquer un Verifiable Credential
    async revokeCredential(ctx, credentialId) {
        const credentialBytes = await ctx.stub.getState(credentialId);
        if (!credentialBytes || credentialBytes.length === 0) {
            throw new Error(`Credential non trouvé: ${credentialId}`);
        }

        const credential = JSON.parse(credentialBytes.toString());
        credential.status = 'revoked'; // Met à jour l'état à 'revoked'

        await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));
    }
}

// Instanciation du chaincode
module.exports = CredentialContract;