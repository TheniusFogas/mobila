'use client';

export default function ConfiguratorNavLink() {
    return (
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 4 }}>
            <a
                href="/configurator"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 6, textDecoration: 'none',
                    background: 'rgba(232, 71, 44, 0.12)', color: '#E8472C',
                    fontSize: 13, fontWeight: 600, transition: 'background 0.15s',
                }}
            >
                <span style={{ fontSize: 16 }}>🔧</span>
                Configurator 3D
            </a>
        </div>
    );
}
