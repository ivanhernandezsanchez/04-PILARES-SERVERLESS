import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Zone, ZoneInput, ZoneStatus } from './src/types';
import { getZones, getZone, createZone, replaceZone, updateZone, deleteZone } from './src/api';

type Screen = 'list' | 'detail' | 'form';

export default function App() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selected, setSelected] = useState<Zone | null>(null);
  const [screen, setScreen] = useState<Screen>('list');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<ZoneStatus>('OPEN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  async function loadZones() {
    setLoading(true);
    setError('');
    try { setZones(await getZones()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Error de red'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadZones(); }, []);

  async function run(label: string, task: () => Promise<unknown>) {
    setError('');
    setResult('');
    try { setResult(label + '\n' + JSON.stringify(await task(), null, 2)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Error de red'); }
  }

  async function openDetail(zone: Zone) {
    setSelected(zone);
    setScreen('detail');
    await run('GET detalle', () => getZone(zone.id));
  }

  function openForm(zone?: Zone) {
    setSelected(zone ?? null);
    setEditing(Boolean(zone));
    setName(zone?.name ?? '');
    setCapacity(zone ? String(zone.capacity) : '');
    setStatus(zone?.status ?? 'OPEN');
    setError('');
    setResult('');
    setScreen('form');
  }

  async function saveZone() {
    const parsedCapacity = Number(capacity);
    if (!name.trim() || !Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      setError('Escribe un nombre y una capacidad entera mayor que cero.');
      return;
    }
    const input: ZoneInput = { name: name.trim(), capacity: parsedCapacity, status };
    await run(editing && selected ? 'PUT reemplazar espacio' : 'POST crear espacio', () =>
      editing && selected ? replaceZone(selected.id, input) : createZone(input));
  }

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>VENUE CONTROL · FESTIVAL OPERATIONS</Text>
        <Text style={styles.title}>Espacios</Text>
        <View style={styles.tabs}>
          <Pressable onPress={() => setScreen('list')} style={[styles.tab, screen === 'list' && styles.activeTab]}><Text style={styles.tabText}>Listado</Text></Pressable>
          <Pressable onPress={() => selected && setScreen('detail')} disabled={!selected} style={[styles.tab, screen === 'detail' && styles.activeTab]}><Text style={styles.tabText}>Detalle</Text></Pressable>
          <Pressable onPress={() => openForm()} style={[styles.tab, screen === 'form' && !editing && styles.activeTab]}><Text style={styles.tabText}>Nuevo</Text></Pressable>
        </View>

        {screen === 'list' ? <>
          <View style={styles.headingRow}>
            <View><Text style={styles.eyebrow}>OPERACIÓN EN DIRECTO</Text><Text style={styles.heading}>{zones.length} zonas</Text></View>
            <Pressable onPress={() => void loadZones()} disabled={loading} style={styles.smallButton}><Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Actualizar'}</Text></Pressable>
          </View>
          {zones.map(zone => <Pressable key={zone.id} onPress={() => void openDetail(zone)} style={styles.row}>
            <View style={styles.zoneInfo}><Text style={styles.zoneName}>{zone.name}</Text><Text style={styles.muted}>{zone.id}</Text></View>
            <View style={styles.capacityBox}><Text style={styles.capacity}>{zone.capacity.toLocaleString('es-ES')}</Text><Text style={styles.muted}>CAPACIDAD</Text></View>
            <Text style={[styles.status, zone.status === 'OPEN' ? styles.open : styles.full]}>● {zone.status}</Text>
          </Pressable>)}
        </> : null}

        {screen === 'detail' && selected ? <View style={styles.panel}>
          <Text style={styles.muted}>{selected.id}</Text>
          <Text style={styles.heading}>{selected.name}</Text>
          <Text style={styles.bodyText}>Capacidad: {selected.capacity.toLocaleString('es-ES')}</Text>
          <Text style={[styles.status, selected.status === 'OPEN' ? styles.open : styles.full]}>● {selected.status}</Text>
          <Pressable onPress={() => openForm(selected)} style={styles.smallButton}><Text style={styles.buttonText}>PUT · Editar</Text></Pressable>
          <Pressable onPress={() => void run('PATCH cambiar estado', () => updateZone(selected.id, { status: selected.status === 'OPEN' ? 'FULL' : 'OPEN' }))} style={styles.smallButton}><Text style={styles.buttonText}>PATCH · Cambiar estado</Text></Pressable>
          <Pressable onPress={() => void run('DELETE eliminar espacio', () => deleteZone(selected.id))} style={styles.deleteButton}><Text style={styles.buttonText}>DELETE · Eliminar</Text></Pressable>
        </View> : null}

        {screen === 'form' ? <View style={styles.panel}>
          <Text style={styles.heading}>{editing ? 'Editar espacio' : 'Nuevo espacio'}</Text>
          <Text style={styles.label}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Garden Stage" placeholderTextColor="#8c9890" style={styles.input} />
          <Text style={styles.label}>Capacidad</Text>
          <TextInput value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="2500" placeholderTextColor="#8c9890" style={styles.input} />
          <Text style={styles.label}>Estado</Text>
          <View style={styles.tabs}>
            {(['OPEN', 'FULL'] as const).map(value => <Pressable key={value} onPress={() => setStatus(value)} style={[styles.tab, status === value && styles.activeTab]}><Text style={styles.tabText}>{value}</Text></Pressable>)}
          </View>
          <Pressable onPress={() => void saveZone()} style={styles.smallButton}><Text style={styles.buttonText}>{editing ? 'PUT · Guardar' : 'POST · Crear'}</Text></Pressable>
        </View> : null}

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {result ? <Text accessibilityLiveRegion="polite" style={styles.result}>{result}</Text> : null}
        <Text style={styles.note}>Catálogo fijo. POST, PUT, PATCH y DELETE devuelven respuestas de ejemplo y no guardan cambios al recargar.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#101713' },
  content: { padding: 24, paddingTop: 42, gap: 18, width: '100%', maxWidth: 820, alignSelf: 'center' },
  eyebrow: { color: '#d8ad5a', fontSize: 11, fontWeight: '700' },
  title: { color: '#f4f1e8', fontSize: 34, fontWeight: '800' },
  tabs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', borderBottomWidth: 1, borderColor: '#3b4840' },
  tab: { paddingVertical: 11, paddingHorizontal: 15, borderBottomWidth: 2, borderColor: 'transparent' },
  activeTab: { borderColor: '#d8ad5a' },
  tabText: { color: '#d8e0d9', fontWeight: '700' },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heading: { color: '#f4f1e8', fontSize: 23, fontWeight: '700' },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14, backgroundColor: '#1b251e', borderLeftWidth: 3, borderLeftColor: '#a3bf77' },
  zoneInfo: { flex: 1, gap: 4 },
  zoneName: { color: '#f4f1e8', fontSize: 17, fontWeight: '700' },
  muted: { color: '#aab6ad', fontSize: 11 },
  capacityBox: { minWidth: 78, alignItems: 'flex-end' },
  capacity: { color: '#f4f1e8', fontSize: 19, fontWeight: '800' },
  status: { minWidth: 74, fontSize: 12, fontWeight: '800' },
  open: { color: '#a6d77f' },
  full: { color: '#efa572' },
  panel: { padding: 18, gap: 12, backgroundColor: '#1b251e', borderWidth: 1, borderColor: '#3b4840' },
  bodyText: { color: '#e0e5df', fontSize: 16 },
  label: { color: '#d8e0d9', fontWeight: '700' },
  input: { padding: 12, borderWidth: 1, borderColor: '#617064', color: '#f4f1e8', fontSize: 16 },
  smallButton: { alignSelf: 'flex-start', padding: 12, backgroundColor: '#d8ad5a' },
  deleteButton: { alignSelf: 'flex-start', padding: 12, backgroundColor: '#9d4c3f' },
  buttonText: { color: '#142018', fontWeight: '800' },
  error: { color: '#ffb2a1', fontSize: 15 },
  result: { padding: 14, color: '#d8ead8', backgroundColor: '#1d2b20', fontFamily: 'monospace', fontSize: 13, lineHeight: 19 },
  note: { color: '#9eaaa0', fontSize: 12, lineHeight: 18 }
});
 