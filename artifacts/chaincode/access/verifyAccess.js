'use strict';

const { Contract } = require('fabric-contract-api');

class SupplyChainContract extends Contract {

    // Ajoute un nouveau rôle avec ses permissions
    async addRole(ctx, name, permissions) {
        const role = {
            name,
            permissions: JSON.parse(permissions), // Convertit les permissions de chaîne en tableau
        };

        await ctx.stub.putState(name, Buffer.from(JSON.stringify(role))); // Stocke le rôle dans l'état de la chaîne
    }

    // Ajoute un nouvel acteur avec son rôle
    async addActor(ctx, id, name, role) {
        const actor = {
            id,
            name,
            role
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(actor))); // Stocke l'acteur dans l'état de la chaîne
    }

    // Vérifie si un acteur a la permission d'accéder à une ressource
    async checkPermission(ctx, actorID, permission) {
        // Récupère l'acteur par ID
        const actorBytes = await ctx.stub.getState(actorID);
        if (!actorBytes || actorBytes.length === 0) {
            throw new Error(`Acteur non trouvé: ${actorID}`);
        }

        const actor = JSON.parse(actorBytes.toString()); // Convertit les bytes en objet Actor

        // Récupère le rôle de l'acteur
        const roleBytes = await ctx.stub.getState(actor.role);
        if (!roleBytes || roleBytes.length === 0) {
            throw new Error(`Rôle non trouvé: ${actor.role}`);
        }

        const role = JSON.parse(roleBytes.toString()); // Convertit les bytes en objet Role

        // Vérifie si la permission est présente dans la liste des permissions du rôle
        if (role.permissions.includes(permission)) {
            return true; // Permission accordée
        }

        return false; // Permission refusée
    }
}

// Instanciation du chaincode
module.exports = SupplyChainContract;