# catppuccin-tldraw-selfhosted

![preview image](./assets/preview.png)

A fork of [FoxxMD/tldraw-selfhosted](https://github.com/FoxxMD/tldraw-selfhosted) with [Catppuccin](https://github.com/catppuccin/catppuccin) theming and adaptive brush palette colors (Macchiato dark / Latte light).

This project offers a self-hostable [tldraw instance](https://www.tldraw.com/). It works slightly differently than the base tldraw experience:

- Collaborative whiteboard with [tldraw sync](https://tldraw.dev/docs/sync) for drawing/diagramming/etc.
- Catppuccin Macchiato and Latte for dark and light themes, respectively. This includes:
    - CSS styling for interface elements.
    - Custom colors for brush strokes that adapt to the viewing user's set theme.
- Create/join public rooms via URL path, e.g. `example.com/board_name`, `localhost/board_name`, etc.
    - If no room name is supplied, it will default to `example.com/main`.
- Based on the legacy version of tldraw (3.15.0) to avoid the hobby license requirement of newer versions.

## Building

This project can be built manually using pnpm or as a Docker container. For both methods, you will need a local clone of this repository:

```sh
git clone https://github.com/dr-pudding/catppuccin-tldraw-selfhosted
cd catppuccin-tldraw-selfhosted
```

### With pnpm

Unlike the original FoxxMD version, this fork uses pnpm instead of yarn in order to patch the base tldraw packages. Build the program:

```sh
pnpm install
pnpm build
```

Run the server:

```sh
pnpm prod
```

### With Docker

Build the image:

```sh
docker build -t catppuccin-tldraw-selfhosted:latest .
```

Run the built image:

```sh
docker run -d \
  --name tldraw \
  -p 5858:5858 \
  -v tldraw-data:/config \
  catppuccin-tldraw-selfhosted:latest
```

## License

This project is provided under the MIT license found [here](/LICENSE). The tldraw 3.15.x SDK is provided under the [tldraw license](https://github.com/tldraw/tldraw/blob/v3.15.x/LICENSE.md). The 3.15.x version permits you to use tldraw without a license for hobby projects only. If you want to use tldraw for commercial projects or run the most up-to-date version, you will need to obtain an SDK license from tldraw.

This project was built on top of the old tldraw packages so that it can be used without a license, and it probably will not work out-of-the-box with the newer versions. I also have no plans of providing support for it myself as I do not have an SDK license for tldraw, though anyone else is free to contribute to or fork this repository if you want to implement it yourself.
