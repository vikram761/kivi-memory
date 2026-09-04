{
  description = "Development environment for phonetic memory task (Python NLP & Bun Backend)";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "aarch64-darwin" "x86_64-darwin" "x86_64-linux" "aarch64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          
          pythonEnv = pkgs.python3.withPackages (ps: with ps; [
            jupyter
            notebook
            nltk
            jellyfish
          ]);
        in
        {
          default = pkgs.mkShell {
            packages = [
              pythonEnv
              pkgs.bun
            ];

            shellHook = ''
              export NLTK_DATA="$(pwd)/.nltk_data"
              mkdir -p $NLTK_DATA
            '';
          };
        }
      );
    };
}
