import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LedgerTable, LedgerRow, Cell } from '../components/LedgerTable';
import { assets, assetById } from '../data/assets';
import { omForAsset, seedCommands, type Command, type CommandStatus } from '../data/control';
import styles from './ControlView.module.css';
import vstyles from './views.module.css';

const SEED_MAX = seedCommands.reduce((m, c) => Math.max(m, c.id), 0);

function nowHM(): string {
  const d = new Date();
  const cet = new Date(d.getTime() + (d.getTimezoneOffset() + 60) * 60000);
  return `${String(cet.getHours()).padStart(2, '0')}:${String(cet.getMinutes()).padStart(2, '0')}`;
}

const statusTone: Record<CommandStatus, 'accent' | 'ink' | 'i2' | 'i3'> = {
  Queued: 'i2',
  Acknowledged: 'i2',
  Executing: 'accent',
  Done: 'i3',
};

export function ControlView() {
  const { assetId } = useParams();
  const [selectedId, setSelectedId] = useState(assetId ?? assets[0].id);
  const asset = assetById(selectedId) ?? assets[0];
  const om = omForAsset(asset.id);

  const [log, setLog] = useState<Command[]>(seedCommands);
  const nextId = useRef(SEED_MAX + 1);

  // Command inputs, reset when the selected asset changes.
  const [cap, setCap] = useState(100);
  const [bessMode, setBessMode] = useState<'Charge' | 'Discharge' | 'Idle'>('Discharge');
  const [bessPower, setBessPower] = useState(0);
  const [targetSoc, setTargetSoc] = useState(50);
  const [net, setNet] = useState(0);

  useEffect(() => {
    setCap(100);
    setBessMode('Discharge');
    setTargetSoc(asset.socPct ?? 50);
    if (asset.type === 'BESS') {
      setBessPower(Math.round(asset.spec.powerMw * 0.5));
    } else {
      setBessPower(Math.round((asset.hybrid?.bessPowerMw ?? 0) * 0.5));
    }
    setNet(0);
  }, [asset.id, asset.type, asset.spec.powerMw, asset.socPct, asset.hybrid?.bessPowerMw]);

  const sessionCmds = log.filter((c) => c.id > SEED_MAX && c.asset === asset.name);
  const overridden = sessionCmds.length > 0;

  function dispatch(text: string) {
    const id = nextId.current;
    nextId.current += 1;
    const cmd: Command = { id, time: nowHM(), asset: asset.name, om: om.name, text, status: 'Queued' };
    setLog((l) => [cmd, ...l]);
    const upd = (status: CommandStatus) =>
      setLog((l) => l.map((c) => (c.id === id ? { ...c, status } : c)));
    window.setTimeout(() => upd('Acknowledged'), 700);
    window.setTimeout(() => upd('Executing'), 1600);
    window.setTimeout(() => upd('Done'), 3400);
  }

  const isBess = asset.type === 'BESS';
  const isHybrid = asset.type === 'Hybrid';
  const isPv = asset.type === 'PV';
  const bessMax = isBess ? asset.spec.powerMw : (asset.hybrid?.bessPowerMw ?? 0);
  const poiCap = asset.hybrid?.poiCapMw ?? 0;

  return (
    <section className={vstyles.view}>
      <h1 className="view-title">Control</h1>
      <div className={vstyles.specLine}>Manual dispatch to the O&amp;M partner, overriding autopilot.</div>

      {/* Asset picker */}
      <div className={styles.pick}>
        <span className={styles.pickLabel}>Asset</span>
        <select
          className={styles.select}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.type}
            </option>
          ))}
        </select>
      </div>

      {/* Command panel */}
      <div className={styles.panel}>
        <div className={styles.identity}>
          <div className={styles.k}>O&amp;M partner</div>
          <div className={styles.partner}>{om.name}</div>
          <div className={styles.channel}>{om.code} · SYNDIS / OPC-UA write</div>

          <div className={styles.stateRow}>
            <span className={styles.k}>Mode</span>
            <span className={overridden ? styles.manual : styles.auto}>
              {overridden ? 'MANUAL' : 'AUTO'}
            </span>
          </div>
          <div className={styles.stateRow}>
            <span className={styles.k}>Type</span>
            <span className={styles.v}>{asset.type}</span>
          </div>
          {asset.socPct != null && (
            <div className={styles.stateRow}>
              <span className={styles.k}>State of charge</span>
              <span className={styles.v}>{asset.socPct}%</span>
            </div>
          )}
          <div className={styles.stateRow}>
            <span className={styles.k}>Rated power</span>
            <span className={styles.v}>{asset.spec.powerMw} MW</span>
          </div>
        </div>

        <div className={styles.commands}>
          {/* Farm on/off — every asset has a plant */}
          <div className={styles.cmd}>
            <div className={styles.cmdLabel}>Plant state</div>
            <div className={styles.actions}>
              <button className="link-inline" onClick={() => dispatch(`Bring ${asset.name} online`)}>
                Bring online
              </button>
              <button className="link-inline" onClick={() => dispatch(`Take ${asset.name} offline`)}>
                Take offline
              </button>
            </div>
          </div>

          {(isPv || isHybrid) && (
            <div className={styles.cmd}>
              <div className={styles.cmdLabel}>
                {isHybrid ? 'PV output cap' : 'Output cap'} <span className={styles.val}>{cap}%</span>
              </div>
              <input
                className={styles.slider}
                type="range"
                min={0}
                max={100}
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
              />
              <div className={styles.actions}>
                <button className="link-inline" onClick={() => dispatch(`Set ${asset.name} output cap to ${cap}%`)}>
                  Apply cap
                </button>
              </div>
            </div>
          )}

          {isBess && (
            <>
              <div className={styles.cmd}>
                <div className={styles.cmdLabel}>Direction &amp; power</div>
                <div className={styles.seg}>
                  {(['Charge', 'Discharge', 'Idle'] as const).map((m) => (
                    <button
                      key={m}
                      className={`${styles.segItem} ${bessMode === m ? styles.segOn : ''}`}
                      onClick={() => setBessMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {bessMode !== 'Idle' && (
                  <>
                    <div className={styles.cmdLabel} style={{ marginTop: 14 }}>
                      Power <span className={styles.val}>{bessPower} MW</span>
                    </div>
                    <input
                      className={styles.slider}
                      type="range"
                      min={0}
                      max={bessMax}
                      value={bessPower}
                      onChange={(e) => setBessPower(Number(e.target.value))}
                    />
                  </>
                )}
                <div className={styles.actions}>
                  <button
                    className="link-inline"
                    onClick={() =>
                      dispatch(
                        bessMode === 'Idle'
                          ? `Set ${asset.name} to idle`
                          : `${bessMode} ${asset.name} at ${bessPower} MW`,
                      )
                    }
                  >
                    Dispatch
                  </button>
                </div>
              </div>

              <div className={styles.cmd}>
                <div className={styles.cmdLabel}>
                  Target state of charge <span className={styles.val}>{targetSoc}%</span>
                </div>
                <input
                  className={styles.slider}
                  type="range"
                  min={0}
                  max={100}
                  value={targetSoc}
                  onChange={(e) => setTargetSoc(Number(e.target.value))}
                />
                <div className={styles.actions}>
                  <button
                    className="link-inline"
                    onClick={() =>
                      dispatch(
                        `${targetSoc >= (asset.socPct ?? 50) ? 'Charge' : 'Discharge'} ${asset.name} to ${targetSoc}% SoC`,
                      )
                    }
                  >
                    Set target
                  </button>
                  <button className="link-inline" onClick={() => dispatch(`Discharge ${asset.name} to 5% SoC`)}>
                    Empty to 5%
                  </button>
                  <button className="link-inline" onClick={() => dispatch(`Charge ${asset.name} to 95% SoC`)}>
                    Fill to 95%
                  </button>
                </div>
              </div>
            </>
          )}

          {isHybrid && (
            <div className={styles.cmd}>
              <div className={styles.cmdLabel}>
                Net power setpoint{' '}
                <span className={styles.val}>
                  {net < 0 ? `${-net} MW charging` : net > 0 ? `${net} MW exporting` : 'hold'}
                </span>
              </div>
              <input
                className={styles.slider}
                type="range"
                min={-bessMax}
                max={poiCap}
                value={net}
                onChange={(e) => setNet(Number(e.target.value))}
              />
              <div className={styles.scaleRow}>
                <span>−{bessMax} charge</span>
                <span>0</span>
                <span>+{poiCap} export</span>
              </div>
              <div className={styles.actions}>
                <button
                  className="link-inline"
                  onClick={() =>
                    dispatch(
                      `${asset.name}: ${net < 0 ? `charge ${-net} MW from grid` : net > 0 ? `export ${net} MW` : 'hold at zero'}`,
                    )
                  }
                >
                  Dispatch setpoint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Command log */}
      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">Command log</div>
          <div className="sec-note">to O&amp;M partners</div>
        </div>
        <LedgerTable
          columns="0.8fr 1.5fr 3fr 1.7fr 1.1fr"
          head={[
            { label: 'Time' },
            { label: 'Asset' },
            { label: 'Command' },
            { label: 'O&M' },
            { label: 'Status', right: true },
          ]}
        >
          {log.map((c) => (
            <LedgerRow key={c.id}>
              <Cell>{c.time}</Cell>
              <Cell name size={16}>
                {c.asset}
              </Cell>
              <Cell tone="ink">{c.text}</Cell>
              <Cell>{c.om}</Cell>
              <Cell right tone={statusTone[c.status]}>
                {c.status}
              </Cell>
            </LedgerRow>
          ))}
        </LedgerTable>
      </div>
    </section>
  );
}
