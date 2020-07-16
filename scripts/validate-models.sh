#!/bin/bash
set -x

function downloadLatestPackageVersion {
    manifest=$(curl "https://packages.simplifier.net/$1")
    version=$(echo "$manifest" | jq -r '[.versions[]][-1].version')
    url=$(echo "$manifest" | jq -r '[.versions[]][-1].url')
    filename="./$1-$version.tgz"
    wget -nc -O "$filename" "$url"
    echo "$filename"
}

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

# ukCorePackage=$(downloadLatestPackageVersion "UK.Core.r4")
ukSpinePackage=$(downloadLatestPackageVersion "UK.Spine.r4")
ukDMPackage=$(downloadLatestPackageVersion "UK.DM.r4")

# validateResources "Patient" "$ukCorePackage" "https://fhir.nhs.uk/R4/StructureDefinition/UKCore-Patient"
validateResources "Patient" "$ukDMPackage" "https://fhir.nhs.uk/R4/StructureDefinition/DM-Patient"
validateResources "MedicationRequest" "$ukDMPackage" "https://fhir.nhs.uk/R4/StructureDefinition/DM-MedicationRequest"
validateResources "PractitionerRole" "$ukSpinePackage" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-PractitionerRole"
validateResources "Practitioner" "$ukSpinePackage" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-Practitioner"
validateResources "Organization" "$ukSpinePackage" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-Organization"
validateResources "MessageHeader" "$ukSpinePackage" "https://fhir.nhs.uk/R4/StructureDefinition/Spine-MessageHeader"
