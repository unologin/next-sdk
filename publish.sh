
yarn build

rm -rf package
mkdir package

cp package.json LICENSE.md README.md package/
cp -r lib/ cjs/ package/

cp package/lib/*.d.ts package/

cd package 
yarn publish
