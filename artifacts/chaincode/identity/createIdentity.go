package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Identity struct représente une identité dans le système
type Identity struct {
	DID       string `json:"did"`       // Identifiant décentralisé
	PublicKey string `json:"publicKey"` // Clé publique associée à l'identité
	Metadata  string `json:"metadata"`  // Métadonnées supplémentaires (ex. méthodes d'authentification)
	X509Cert  string `json:"x509Cert"`  // Certificat X.509 associé à l'identité
}

// SmartContract définit la structure du contrat intelligent
type SmartContract struct {
	contractapi.Contract
}

// CreateIdentity crée une nouvelle identité avec un DID et un certificat X.509
func (s *SmartContract) CreateIdentity(ctx contractapi.TransactionContextInterface, did string, publicKey string, metadata string, x509Cert string) error {
	// Créer une nouvelle instance d'Identity
	identity := Identity{
		DID:       did,
		PublicKey: publicKey,
		Metadata:  metadata,
		X509Cert:  x509Cert,
	}

	// Convertir l'identité en JSON
	identityJSON, err := json.Marshal(identity)
	if err != nil {
		return fmt.Errorf("échec de la conversion de l'identité en JSON: %v", err)
	}

	// Enregistrer l'identité dans l'état mondial (ledger)
	err = ctx.GetStub().PutState(did, identityJSON)
	if err != nil {
		return fmt.Errorf("échec de l'enregistrement de l'identité dans l'état mondial: %v", err)
	}

	return nil
}

// ReadIdentity récupère une identité à partir du ledger en utilisant le DID
func (s *SmartContract) ReadIdentity(ctx contractapi.TransactionContextInterface, did string) (*Identity, error) {
	// Lire l'identité depuis l'état mondial
	identityJSON, err := ctx.GetStub().GetState(did)
	if err != nil {
		return nil, fmt.Errorf("échec de la lecture de l'identité: %v", err)
	}
	if identityJSON == nil {
		return nil, fmt.Errorf("l'identité %s n'existe pas", did)
	}

	// Convertir le JSON en struct Identity
	var identity Identity
	err = json.Unmarshal(identityJSON, &identity)
	if err != nil {
		return nil, fmt.Errorf("échec de la conversion du JSON en identité: %v", err)
	}

	return &identity, nil
}

// UpdateIdentity met à jour le certificat X.509 pour une identité donnée
func (s *SmartContract) UpdateIdentity(ctx contractapi.TransactionContextInterface, did string, x509Cert string) error {
	// Récupérer l'identité existante
	identity, err := s.ReadIdentity(ctx, did)
	if err != nil {
		return err
	}

	// Mettre à jour le certificat X.509
	identity.X509Cert = x509Cert
	identityJSON, err := json.Marshal(identity)
	if err != nil {
		return fmt.Errorf("échec de la conversion de l'identité mise à jour en JSON: %v", err)
	}

	// Enregistrer l'identité mise à jour dans l'état mondial
	return ctx.GetStub().PutState(did, identityJSON)
}

// main initialise le chaincode
func main() {
	// Créer une instance du chaincode
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		log.Panicf("Erreur lors de la création du chaincode Identity: %v", err)
	}

	// Démarrer le chaincode
	if err := chaincode.Start(); err != nil {
		log.Panicf("Erreur lors du démarrage du chaincode Identity: %v", err)
	}
}
