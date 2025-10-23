/**
 * Script to mint a trusted token for Stytch testing
 * Usage: tsx scripts/mint-trusted-token.ts
 */
import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, "../.env.local") });
import { mintTrustedTokenForStytch } from "../src/domains/smart/stytch";
async function main() {
  const organizationId =
    "organization-test-9dc35114-e414-4f27-8530-58eff7ed042c";
  const practitionerUuid = "my-external-identifier";
  const email = "jonathan@awellhealth.com";
  try {
    const token = await mintTrustedTokenForStytch({
      organizationId,
      practitionerUuid,
      email,
    });

    if (!token) {
      console.error(
        "❌ Failed to mint token. Check that environment variables are set:"
      );
      console.error("  - STYTCH_TRUSTED_TOKEN_PRIVATE_KEY_B64");
      console.error("  - STYTCH_TRUSTED_TOKEN_KID");
      process.exit(1);
    }

    console.log("✅ Successfully minted trusted token!\n");
    console.log("Token:");
    console.log(token);
    console.log("");
    console.log("To test the /smart/direct route, use:");
    console.log(
      `curl "http://localhost:3000/smart/direct?patient_identifier=https://www.medplum.com/docs/api/fhir/resources/patient|0199f230-b2b2-740a-9122-bf84912e24d2&token=${token}&organization_id=${organizationId}"`
    );
  } catch (error) {
    console.error("❌ Error minting token:", error);
    process.exit(1);
  }
}

main();
