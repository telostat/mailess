{
  description = "Nix Development Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/release-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let
        nixpkgs = import inputs.nixpkgs { inherit system; };
      in
      {
        devShell = nixpkgs.mkShell {
          buildInputs = [
            nixpkgs.nodejs_22
            nixpkgs.nodePackages.typescript-language-server
            nixpkgs.nodePackages.nodemon
            nixpkgs.nodePackages.npm-check-updates

          ];
          shellHook = ''
            export SHELL=/run/current-system/sw/bin/zsh
          '';
        };
      }
    );
}
