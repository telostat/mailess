let
  sources = import ./nix/sources.nix { };
  pkgs = import sources.nixpkgs { };
in
pkgs.mkShell {
  name = "dev-shell";

  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.nodemon
    nodePackages.npm-check-updates
    yarn
  ];

  shellHook = ''
  '';
}
