Start Project
## Ubuntu
```
sudo apt-get install build-essential
make
```


### Create constraints
```bash
CREATE CONSTRAINT FOR (n:Person) REQUIRE (n.personalId) IS UNIQUE
```


### Write Query
https://neo4j.com/docs/cypher-manual/current/clauses/


## Get Single Nodes
```
MATCH (a) WHERE not ((a)--()) RETURN *;
```

## Index in Neo4j

Tutorial: https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/

```bash
# Create Index
CREATE FULLTEXT INDEX person_and_project FOR (n:Person|Project) ON EACH [n.name, n.personalId ,n.description]

# Drop index
DROP INDEX person_and_project


# Query
CALL db.index.fulltext.queryNodes("person_and_project", "yaser") YIELD node, score
RETURN node, score

# Query With Regex
CALL db.index.fulltext.queryNodes("person_and_project", "*y*") YIELD node, score
RETURN node, score
```