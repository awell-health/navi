import { Patient } from "@medplum/fhirtypes";

export const getTestPatient = (): Patient => ({
  "resourceType": "Patient",
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MPI",
            "display": "Master Patient Index"
          }
        ]
      },
      "system": "https://davita.com/fhir/identifier/mpi",
      "value": "1001"
    },
    {
      "use": "secondary",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "EMRID",
            "display": "EMR Identifier"
          }
        ]
      },
      "system": "https://davita.com/fhir/identifier/emr-id",
      "value": "123456"
    },
    {
      "use": "secondary",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "SS",
            "display": "Social Security Number"
          }
        ]
      },
      "system": "http://hl7.org/fhir/sid/us-ssn",
      "value": "123-45-6789"
    },
    {
      "system": "https://launch.smarthealthit.org/v/r4/fhir",
      "value": "0198f58b-15d3-736b-9e38-a82ea34d695f"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": [
        "John"
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "555-1234",
      "use": "home"
    },
    {
      "system": "email",
      "value": "john.doe@example.com",
      "use": "home"
    }
  ],
  "address": [
    {
      "use": "home",
      "type": "both",
      "text": "123 Main St"
    }
  ],
  "extension": [
    {
      "url": "https://davita.com/fhir/StructureDefinition/disease-stage",
      "valueString": "ESKD"
    },
    {
      "url": "https://davita.com/fhir/StructureDefinition/ikc-dkc-classification",
      "valueString": "IKC"
    },
    {
      "url": "https://davita.com/fhir/StructureDefinition/vbc-program",
      "valueString": "CKCC"
    }
  ],
  "gender": "male",
  "birthDate": "1980-01-01",
  "id": "0198f58b-15d3-736b-9e38-a82ea34d695f",
  "meta": {
    "project": "0196d846-f275-7096-ba15-5ca3204cf8f4",
    "compartment": [
      {
        "reference": "Project/0196d846-f275-7096-ba15-5ca3204cf8f4"
      },
      {
        "reference": "Patient/0198f58b-15d3-736b-9e38-a82ea34d695f"
      }
    ],
    "versionId": "0198f59d-cba2-76cb-8166-dcb6d8ae950f",
    "lastUpdated": "2025-08-29T11:36:55.970Z",
    "author": {
      "reference": "Practitioner/0196d846-f2cf-731b-93a0-a669fc462e42",
      "display": "Flavio Ferreira"
    }
  }
});
