#!/bin/bash
set -eu

FARO_DATA_PATH=${FARO_DATA_PATH:-$HOME/Sviluppo/Net/faro_data}
FARO_DB_HOST=${FARO_DB_HOST:-host.docker.internal:27073}

function data(){
    mkdir -p FARO.snapshot
    cd FARO.snapshot    
    SNAPSHOT_PATH=$(pwd)
    
    # Compress samples data
    echo Compressing data from $FARO_DATA_PATH to $SNAPSHOT_PATH...
    cd $FARO_DATA_PATH

    tar -cjf $SNAPSHOT_PATH/snapshot.bzip2 .
}

function db(){

    mkdir -p FARO.snapshot
    cd FARO.snapshot    
    SNAPSHOT_PATH=$(pwd)

    echo Freezing mongo data from $FARO_DB_HOST...
    # Mongo dump
    docker run --network="container:${FARO_DB_HOST}" --rm -v $(pwd):/db-dump -w /db-dump mongo sh -c "mongodump --host=${FARO_DB_HOST} --authenticationDatabase admin -u root -p admin --db faro --archive" > db.dump
    
}

# Check if the function exists (bash specific)
if declare -f "$1" > /dev/null
then
  # call arguments verbatim
  "$@"
else
  # Show a helpful error
  echo "'$1' is not a known function name" >&2
  exit 1
fi