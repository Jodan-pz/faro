#!/bin/bash
set -eu

FARO_DATA_PATH=${FARO_DATA_PATH:-$HOME/Sviluppo/Net/faro_data}
FARO_DB_HOST=${FARO_DB_HOST:-host.docker.internal:27073}

function data(){
    cd FARO.snapshot
    SNAPSHOT_PATH=$(pwd)

    # Uncompress samples data
    echo Uncompressing data to $FARO_DATA_PATH from $SNAPSHOT_PATH...
    mkdir -p $FARO_DATA_PATH
    cd $FARO_DATA_PATH

    tar -xvf $SNAPSHOT_PATH/snapshot.bzip2
}

function db(){
    cd FARO.snapshot    
    SNAPSHOT_PATH=$(pwd)

    echo Hydrating mongo data to $FARO_DB_HOST...
    # Mongo restore
    docker run --network="container:${FARO_DB_HOST}" --rm -v $(pwd):/db-dump -w /db-dump mongo sh -c "mongorestore --drop --preserveUUID --host=${FARO_DB_HOST} --authenticationDatabase admin -u root -p admin --db faro --archive=./db.dump"
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
