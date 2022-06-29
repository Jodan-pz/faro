// init mongo db script
db.createUser(
    {
        user: "root",
        pwd: "admin",
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "dbAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" }
        ]
    }
)

db.createUser(
    {
        user: "faro",
        pwd: "farodb",
        roles: [
            { role: "dbAdmin", db: "faro" },
            { role: "dbOwner", db: "faro" },
            { role: "userAdmin", db: "faro" },
            { role: "readWrite", db: "faro" }
        ]
    }
)

db.createCollection("aggregators", { collation: { locale: 'en_US', strength: 2 } })
db.aggregators.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.aggregators.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.aggregators.createIndex({ Description: 1 }) // inherits the default collation
db.aggregators.createIndex({ Tags: 1 }) // inherits the default collation

db.createCollection("validators", { collation: { locale: 'en_US', strength: 2 } })
db.validators.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.validators.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.validators.createIndex({ Description: 1 }) // inherits the default collation
db.validators.createIndex({ Tags: 1 }) // inherits the default collation

db.createCollection("flows", { collation: { locale: 'en_US', strength: 2 } })
db.flows.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.flows.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.flows.createIndex({ Description: 1 }) // inherits the default collation
db.flows.createIndex({ Tags: 1 }) // inherits the default collation

db.createCollection("writers", { collation: { locale: 'en_US', strength: 2 } })
db.writers.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.writers.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.writers.createIndex({ Description: 1 }) // inherits the default collation
db.writers.createIndex({ Tags: 1 }) // inherits the default collation

db.createCollection("images", { collation: { locale: 'en_US', strength: 2 } })
db.images.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.images.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.images.createIndex({ Description: 1 }) // inherits the default collation
db.images.createIndex({ Tags: 1 }) // inherits the default collation

db.createCollection("keysiterators", { collation: { locale: 'en_US', strength: 2 } })
db.keysiterators.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.keysiterators.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.keysiterators.createIndex({ Description: 1 }) // inherits the default collation
db.keysiterators.createIndex({ Tags: 1 }) // inherits the default collation

db.createCollection("decorators", { collation: { locale: 'en_US', strength: 2 } })
db.decorators.createIndex({ Name: 1 }, { unique: true }) // inherits the default collation
db.decorators.createIndex({ Name: 1, Description: 1 }) // inherits the default collation
db.decorators.createIndex({ Description: 1 }) // inherits the default collation
db.decorators.createIndex({ Tags: 1 }) // inherits the default collation