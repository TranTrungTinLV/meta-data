PROJECT = "Metadata"

run: 
	yarn run start
	
run-dev: 
	yarn run start:dev

heath-check: 
	nx run-many --target=serve --all --maxParallel=100 --exclude=heath-check

run-all: 
	nx run-many --maxParallel=100 --target=serve --projects=all	

complie-proto:
	./1_proto_to_ts.sh

temporal: 
	temporal server start-dev --ui-ip 192.168.68.129 --ui-port 8081 --db-filename temporal_backup.db

compodoc: 
	npx @compodoc/compodoc -p tsconfig.base.json -s -r 9090

docker-up:
	docker compose up 

docker-down:
	docker compose down 

docker-stating-up:
	docker compose -f docker-compose.staging.yml up

docker-stating-down:
	docker compose -f docker-compose.staging.yml down

clean : ;
	rm -rf node_modules

.PHONY: all run temporal complie-proto compodoc clean