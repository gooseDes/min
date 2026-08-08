pkgname=min-desktop-bin
_pkgname=min-desktop
pkgver=1.0.0
pkgrel=1
pkgdesc="The best messenger in the world (no)"
arch=('x86_64')
url="https://github.com/gooseDes/min-web"
license=('MIT')

depends=('webkit2gtk-4.1' 'gtk3' 'libsoup3' 'openssl' 'xdotool' 'polkit')

provides=("$_pkgname")
conflicts=("$_pkgname")

source=("LOCAL_DEB_FILE_PLACEHOLDER")
sha256sums=('SKIP')

package() {
    bsdtar -xf data.tar.* -C "$pkgdir/"
}
