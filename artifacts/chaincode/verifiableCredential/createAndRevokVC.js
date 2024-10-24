'use strict';

const { Contract } = require('fabric-contract-api');

class CredentialContract extends Contract {

    // Émet un Verifiable Credential
    async issueCredential(ctx, credentialId, holderId, claims) {
        // Création de l'objet credential avec les informations fournies
        const credential = {
            credentialId,            // Identifiant unique du credential
            holderId,                // Identifiant du titulaire du credential
            claims,                  // Elements d'identité associées au credential
            issuedAt: new Date().toISOString(), // Date d'émission au format ISO
            status: 'active',        // État initial du credential (actif) pour dire qu'il est valide
        };

        // Vérifie si le credential existe déjà dans l'état de la chaîne
        const existingCredential = await ctx.stub.getState(credentialId);
        if (existingCredential && existingCredential.length > 0) {
            throw new Error(`Credential déjà existant: ${credentialId}`);
        }

        // Stocke le credential dans la Blockchain
        await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));
    }

    // Récupération d'un Verifiable Credential par ID
    async readCredential(ctx, credentialId) {
        // Récupération des données du credential à partir de l'état de la chaîne
        const credentialBytes = await ctx.stub.getState(credentialId);
        if (!credentialBytes || credentialBytes.length === 0) {
            throw new Error(`Credential non trouvé: ${credentialId}`);
        }

        // Retourne le credential sous forme de chaîne
        return credentialBytes.toString();
    }

    // Révoquer un Verifiable Credential
    async revokeCredential(ctx, credentialId) {
        // Récupération du credential existant par ID
        const credentialBytes = await ctx.stub.getState(credentialId);
        if (!credentialBytes || credentialBytes.length === 0) {
            throw new Error(`Credential non trouvé: ${credentialId}`);
        }

        // Conversion des bytes en objet JavaScript
        const credential = JSON.parse(credentialBytes.toString());
        
        // Mise à jour de l'état du credential à 'revoked' pour dire qu'il est maintenant non valide
        credential.status = 'revoked'; // Indique que le credential a été révoqué

        // Stocke le credential mis à jour dans l'état de la chaîne
        await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));
    }
}

// Instanciation du chaincode
module.exports = CredentialContract;