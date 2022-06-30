ARG NETCORE_BUILD_IMG=mcr.microsoft.com/dotnet/sdk

# 1. Prepare server side build image
FROM $NETCORE_BUILD_IMG as api-base
WORKDIR /workspace

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    # Verify common dependencies and utilities are installed
    && apt-get -y install --no-install-recommends apt-utils git curl less bzip2 2>&1 \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# 2. Restore api deps
FROM api-base as build-deps
COPY ./NuGet.Config ./NuGet.Config
COPY ./FARO.common/FARO.common.csproj FARO.common/
COPY ./FARO.datalayer.mongodb/FARO.datalayer.mongodb.csproj FARO.datalayer.mongodb/
COPY ./FARO.servicelayer/FARO.servicelayer.csproj FARO.servicelayer/
COPY ./FARO.expression.flee/FARO.expression.flee.csproj FARO.expression.flee/
COPY ./FARO.test/FARO.test.csproj FARO.test/
RUN dotnet restore ./FARO.test/FARO.test.csproj

#3. Copy api
FROM build-deps as api-build
COPY ./FARO.common/ ./FARO.common
COPY ./FARO.datalayer.mongodb ./FARO.datalayer.mongodb
COPY ./FARO.servicelayer ./FARO.servicelayer
COPY ./FARO.expression.flee ./FARO.expression.flee
COPY ./FARO.test ./FARO.test

#4. Mongo config
FROM api-build as mongo-configured
RUN echo '{\
    "Current": "LOCAL_TEST",\
    "Connections": {\
    "LOCAL_TEST": {\
    "Host": "faro-db-test",\
    "Port": "27017",\
    "User": "faro",\
    "Pwd": "farodb",\
    "Database": "faro"\
    }\
    }\
    }' > ./FARO.test/mongodb.config.json