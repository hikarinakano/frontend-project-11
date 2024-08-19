make install:
	npm ci

make lint: # launch npx eslint
	npx eslint .	

make test: # starts tests
	npm test

make test-coverage: #tests coverage
	npm test -- --coverage 

make start: # starts server
	npm start
