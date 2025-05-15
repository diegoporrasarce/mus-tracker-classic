import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupScreen({ route, navigation }) {
  const { name } = route.params;
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadGroupData);
    return unsubscribe;
  }, [navigation]);

  const loadGroupData = async () => {
    const data = await AsyncStorage.getItem(`data-${name}`);
    if (data) {
      const parsed = JSON.parse(data);
      setPlayers(parsed.players || []);
      setMatches(parsed.matches || []);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grupo: {name}</Text>

      <Button
        title="Editar jugadores"
        onPress={() => navigation.navigate('AñadirJugadores', { groupName: name })}
      />
      <Text style={styles.sectionText}>
        Jugadores: {players.length > 0 ? players.join(', ') : 'Ninguno'}
      </Text>

      <View style={{ marginVertical: 10 }}>
        <Button
          title="Registrar Partida"
          onPress={() => navigation.navigate('RegistrarPartida', { groupName: name })}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button
          title="Estadísticas"
          onPress={() => navigation.navigate('Estadísticas', { groupName: name })}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button
          title="Elegir parejas aleatorias"
          onPress={() => navigation.navigate('ParejasAleatorias', { groupName: name })}
        />
      </View>

      <Button
        title={showHistory ? 'Ocultar historial' : 'Ver historial'}
        onPress={() => setShowHistory(!showHistory)}
      />

      {showHistory && (
        <>
          <Text style={styles.sectionTitle}>Historial de partidas</Text>
          <FlatList
            data={matches}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 5 }}>
                <Text>
                  {new Date(item.date).toLocaleDateString()} - Resultado: {item.result}
                </Text>
                <Text>
                  Ganó {item.winner === 'A'
                    ? `${item.teamA[0]} y ${item.teamA[1]}`
                    : `${item.teamB[0]} y ${item.teamB[1]}`}
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ marginTop: 10 }}>Aún no hay partidas</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 10, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#444',
  },
});
