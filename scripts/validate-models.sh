#!/bin/bash
set -x

function validateResources {
    # Tidy up files from previous runs
    rm "$1_"*
    rm "ValidationResults_$1.txt"

    # Extract all resources of the selected type into a file, one per line
    for f in models/examples/*/*.json
    do
        jq -c ".entry[]?.resource? | select(.resourceType==\"$1\")" < "$f" >> "$1_All"
    done

    # Split each line into a separate file and remove the original file
    split -l 1 "$1_All" "$1_"
    rm "$1_All"

    # Validate the individual files against the selected profile
    java -jar models/dist/org.hl7.fhir.validator.jar "./$1_"* \
        -version 4.0.1 -tx n/a -ig "$2" -profile "$3" \
        | tee "ValidationResults_$1.txt"

    # Tidy up temp files
    rm "$1_"*
}

wget -nc https://packages.simplifier.net/UK.Spine.r4/-/UK.Spine.r4-0.0.3-dev.tgz
wget -nc https://packages.simplifier.net/UK.Core.r4/-/UK.Core.r4-1.2.0.tgz
wget -nc https://packages.simplifier.net/UK.DM.r4/-/UK.DM.r4-0.0.18-dev.tgz

# validateResources "Patient" "./UK.Core.r4-1.2.0.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/UKCore-Patient"
validateResources "Patient" "./UK.DM.r4-0.0.18-dev.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/DM-Patient"
validateResources "MedicationRequest" "./UK.DM.r4-0.0.18-dev.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/DM-MedicationRequest"
validateResources "PractitionerRole" "UK.Spine.r4-0.0.3-dev.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-PractitionerRole"
validateResources "Practitioner" "UK.Spine.r4-0.0.3-dev.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-Practitioner"
validateResources "Organization" "UK.Spine.r4-0.0.3-dev.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-Organization"
validateResources "MessageHeader" "UK.Spine.r4-0.0.3-dev.tgz" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-MessageHeader"
