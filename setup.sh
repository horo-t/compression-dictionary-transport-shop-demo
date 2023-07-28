#!/bin/bash -e

readonly BROTLI_REV="4fc753e707c141328ee707bc2df23603391d0102"

rm -rf third_party

mkdir third_party
cd third_party

# Download brotli

git clone https://github.com/google/brotli.git
cd brotli
git checkout $BROTLI_REV

bazel build brotli

cd research/

bazel build dictionary_generator

cd ../../../

cd data

rm -f *.br *.sbr *.dict

../third_party/brotli/research/bazel-bin/dictionary_generator -t100k ./shop.dict ./*.html

../third_party/brotli/bazel-bin/brotli 1f3bf.html -o 1f3bf.html.br
../third_party/brotli/bazel-bin/brotli 1f45e.html -o 1f45e.html.br
../third_party/brotli/bazel-bin/brotli 1f45f.html -o 1f45f.html.br
../third_party/brotli/bazel-bin/brotli 1f460.html -o 1f460.html.br
../third_party/brotli/bazel-bin/brotli 1f461.html -o 1f461.html.br
../third_party/brotli/bazel-bin/brotli 1f462.html -o 1f462.html.br
../third_party/brotli/bazel-bin/brotli 1f6fc.html -o 1f6fc.html.br
../third_party/brotli/bazel-bin/brotli 1f97e.html -o 1f97e.html.br
../third_party/brotli/bazel-bin/brotli 1f97f.html -o 1f97f.html.br
../third_party/brotli/bazel-bin/brotli 1fa70.html -o 1fa70.html.br
../third_party/brotli/bazel-bin/brotli 1fa74.html -o 1fa74.html.br
../third_party/brotli/bazel-bin/brotli 26f8.html  -o  26f8.html.br

../third_party/brotli/bazel-bin/brotli shop.dict -o shop.dict.br

../third_party/brotli/bazel-bin/brotli 1f3bf.html -D shop.dict -o 1f3bf.html.sbr
../third_party/brotli/bazel-bin/brotli 1f45e.html -D shop.dict -o 1f45e.html.sbr
../third_party/brotli/bazel-bin/brotli 1f45f.html -D shop.dict -o 1f45f.html.sbr
../third_party/brotli/bazel-bin/brotli 1f460.html -D shop.dict -o 1f460.html.sbr
../third_party/brotli/bazel-bin/brotli 1f461.html -D shop.dict -o 1f461.html.sbr
../third_party/brotli/bazel-bin/brotli 1f462.html -D shop.dict -o 1f462.html.sbr
../third_party/brotli/bazel-bin/brotli 1f6fc.html -D shop.dict -o 1f6fc.html.sbr
../third_party/brotli/bazel-bin/brotli 1f97e.html -D shop.dict -o 1f97e.html.sbr
../third_party/brotli/bazel-bin/brotli 1f97f.html -D shop.dict -o 1f97f.html.sbr
../third_party/brotli/bazel-bin/brotli 1fa70.html -D shop.dict -o 1fa70.html.sbr
../third_party/brotli/bazel-bin/brotli 1fa74.html -D shop.dict -o 1fa74.html.sbr
../third_party/brotli/bazel-bin/brotli 26f8.html  -D shop.dict -o  26f8.html.sbr

ls -al

npm install

npm start run
