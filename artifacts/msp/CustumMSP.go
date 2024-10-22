package main

import (
	"fmt"

	mspPkg "github.com/hyperledger/fabric/msp" // Renommage de l'import
)

// CustomMSP est une implémentation personnalisée de MSP
type CustomMSP struct {
	mspPkg.MSP
	didStore map[string]string // Map pour stocker les DIDs et leurs certificats X.509
}

// NewCustomMSP crée une nouvelle instance de CustomMSP
func NewCustomMSP() *CustomMSP {
	return &CustomMSP{
		didStore: make(map[string]string),
	}
}

// RegisterDID enregistre un DID et son certificat X.509
func (m *CustomMSP) RegisterDID(did string, certificate string) {
	m.didStore[did] = certificate // Ajoute le DID et le certificat au store
}

// ValidateIdentity valide un DID et son certificat X.509
func (m *CustomMSP) ValidateIdentity(did string, certificate []byte) error {
	// Vérifiez si le DID existe dans le didStore
	cert, exists := m.didStore[did]
	if !exists {
		return fmt.Errorf("DID %s non trouvé", did)
	}

	// Validez le certificat X.509 ici (ex: en vérifiant la chaîne de confiance)
	if !isValidCertificate(certificate, cert) {
		return fmt.Errorf("Certificat X.509 invalide pour le DID %s", did)
	}

	return nil // Retourne nil si la validation passe
}

// isValidCertificate vérifie la validité d'un certificat X.509
func isValidCertificate(certificate []byte, expectedCert string) bool {
	// Exemple simplifié : comparez les certificats sous forme de chaînes
	return string(certificate) == expectedCert
}

// main est le point d'entrée de l'application
func main() {
	// Créez une instance de CustomMSP
	customMSP := NewCustomMSP()

	// Enregistrement d'un DID et d'un certificat
	did := "did:example:123456789abcdefghi"
	cert := "-----BEGIN CERTIFICATE-----\nMIIC...IDAQAB\n-----END CERTIFICATE-----"
	customMSP.RegisterDID(did, cert)

	// Validation du DID et du certificat
	err := customMSP.ValidateIdentity(did, []byte(cert))
	if err != nil {
		fmt.Println("Erreur de validation :", err)
	} else {
		fmt.Println("Validation réussie pour le DID :", did)
	}
}
