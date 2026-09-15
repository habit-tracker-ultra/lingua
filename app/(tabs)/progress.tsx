import { StyleSheet, Text, View } from 'react-native';

const skills = [
  ['Vocabulary', '88%'],
  ['Grammar', '67%'],
  ['Speaking', '76%'],
  ['Everyday English', '59%'],
];

export default function ProgressScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>PROGRESS</Text>

      <Text style={styles.title}>
        See how far you've come.
      </Text>

      <Text style={styles.subtitle}>
        Learning history will become account-synced data once the backend is connected.
      </Text>

      <View style={styles.stats}>
        <View style={styles.card}>
          <Text style={styles.value}>12</Text>
          <Text style={styles.label}>Day streak</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>248</Text>
          <Text style={styles.label}>Words learned</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>76%</Text>
          <Text style={styles.label}>Speaking</Text>
        </View>
      </View>

      <View style={styles.cardWide}>
        <Text style={styles.section}>
          Skill balance
        </Text>

        {skills.map(([name, pct]) => (
          <View style={styles.skill} key={name}>
            <View style={styles.row}>
              <Text style={styles.label}>{name}</Text>
              <Text style={styles.label}>{pct}</Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: pct as `${number}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 20,
    paddingTop: 24,
  },

  eyebrow: {
    color: '#5B5CE2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 5,
  },

  subtitle: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 16,
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E9F0',
    borderRadius: 20,
    padding: 18,
    flex: 1,
    minWidth: 100,
  },

  cardWide: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E9F0',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },

  value: {
    color: '#5B5CE2',
    fontSize: 30,
    fontWeight: '900',
  },

  label: {
    color: '#596174',
    fontSize: 12,
    fontWeight: '700',
  },

  section: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },

  skill: {
    marginBottom: 13,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  track: {
    height: 8,
    backgroundColor: '#ECEEF5',
    borderRadius: 8,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    backgroundColor: '#5B5CE2',
    borderRadius: 8,
  },
});