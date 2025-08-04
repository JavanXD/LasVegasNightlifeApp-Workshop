console.log('External script executed');
document.body.style.backgroundColor = '#ff4d4d';

const banner = document.createElement('div');
banner.style.position = 'fixed';
banner.style.top = '0';
banner.style.left = '0';
banner.style.width = '100%';
banner.style.padding = '10px';
banner.style.textAlign = 'center';
banner.style.backgroundColor = '#000';
banner.style.color = '#fff';
banner.style.fontSize = '20px';
banner.style.zIndex = '9999';
banner.innerHTML = 'Hacked by XSS! External script loaded.';
document.body.prepend(banner);