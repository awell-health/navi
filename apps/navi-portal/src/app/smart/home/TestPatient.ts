import { Patient } from "@medplum/fhirtypes";

export const getTestPatient = (): Patient => ({
  "resourceType": "Patient",
  "active": true,
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
      "system": "https://davita.com/mpi",
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
      "value": "0198f5fc-644b-75c1-832e-4381032b37b8"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": [
        "John"
      ],
      "text": "John Doe"
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
      "url": "https://awellhealth.com/fhir/StructureDefinition/patient-bot-processed",
      "extension": [
        {
          "url": "event-type",
          "valueString": "patient.created"
        },
        {
          "url": "processed-at",
          "valueDateTime": "2025-08-29T13:20:15.381Z"
        },
        {
          "url": "bot-version",
          "valueString": "1.0.0"
        }
      ]
    },
    {
      "url": "https://awellhealth.com/fhir/StructureDefinition/awell-data-points",
      "extension": [
        {
          "url": "activeCareFlowNbrOfResults",
          "valueString": "0"
        },
        {
          "url": "activeCareFlowNbrOfResults_label",
          "valueString": "activeCareFlowNbrOfResults"
        },
        {
          "url": "lastName",
          "valueString": "Doe"
        },
        {
          "url": "programSite",
          "valueString": "IKC"
        },
        {
          "url": "programDiseaseStage",
          "valueString": "ESKD"
        },
        {
          "url": "programSite_label",
          "valueString": "programSite"
        },
        {
          "url": "activeCareFlowResult",
          "valueString": "false"
        },
        {
          "url": "activeCareFlowResult_label",
          "valueString": "activeCareFlowResult"
        },
        {
          "url": "firstName",
          "valueString": "John"
        },
        {
          "url": "programDiseaseStage_label",
          "valueString": "programDiseaseStage"
        },
        {
          "url": "firstName_label",
          "valueString": "firstName"
        },
        {
          "url": "inboundPayload",
          "valueString": "[object Object]"
        },
        {
          "url": "programVbc",
          "valueString": "CKCC"
        },
        {
          "url": "programVbc_label",
          "valueString": "programVbc"
        },
        {
          "url": "lastName_label",
          "valueString": "lastName"
        }
      ]
    },
    {
      "url": "https://awellhealth.com/fhir/StructureDefinition/awell-data-points-json",
      "extension": [
        {
          "url": "inboundPayload",
          "valueString": "{\"mpi\":1001,\"identifier_mrn\":\"\",\"identifier_emr\":123456,\"name_given\":\"John\",\"name_family\":\"Doe\",\"birth_date\":\"1980-01-01\",\"gender\":\"male\",\"ssn\":\"123-45-6789\",\"address\":\"123 Main St\",\"phone\":\"555-1234\",\"email\":\"john.doe@example.com\",\"program_disease_stage\":\"ESKD\",\"program_site\":\"IKC\",\"program_vbc\":\"CKCC\"}"
        }
      ]
    }
  ],
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "en"
          }
        ]
      }
    }
  ],
  "gender": "male",
  "birthDate": "1980-01-01",
  "id": "0198f5fc-644b-75c1-832e-4381032b37b8",
  "meta": {
    "project": "0196d846-f275-7096-ba15-5ca3204cf8f4",
    "compartment": [
      {
        "reference": "Project/0196d846-f275-7096-ba15-5ca3204cf8f4"
      },
      {
        "reference": "Patient/0198f5fc-644b-75c1-832e-4381032b37b8"
      }
    ],
    "versionId": "0198f60f-e60b-722a-a1f7-392997c70ba8",
    "lastUpdated": "2025-08-29T13:41:33.835Z",
    "author": {
      "reference": "Practitioner/0196d846-f2cf-731b-93a0-a669fc462e42",
      "display": "Flavio Ferreira"
    }
  }
});
