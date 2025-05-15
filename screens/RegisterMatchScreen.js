import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterMatchScreen({ route, navigation }) {
  const { groupName } = route.params;
  const [players, setPlayers] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [pointsA, setPointsA] = useState('');
  const [pointsB, setPointsB] = useState('');
  const [showTeamAList, setShowTeamAList] = useState(false);
  const [showTeamBList, setShowTeamBList] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const data = await AsyncStorage.getItem(`data-${groupName}`);
    if (data) {
      const parsed = JSON.parse(data);
      setPlayers(parsed.players || []);
    }
  };

  const togglePlayer = (player, teamSetter, team, otherTeam) => {
    if (otherTeam.includes(player)) {
      Alert.alert('Jugador duplicado', `${player} ya está en la otra pareja`);
      return;
    }

    if (team.includes(player)) {
      teamSetter(team.filter(p => p !== player));
    } else if (team.length < 2) {
      teamSetter([...team, player]);
    }
  };

  const saveMatch = async () => {
    const pa = parseInt(pointsA);
    const pb = parseInt(pointsB);
    if (
      teamA.length !== 2 ||
      teamB.length !== 2 ||
      isNaN(pa) ||
      isNaN(pb)
    ) {
      Alert.alert('Completa todos los campos');
      return;
    }

    const winner = pa > pb ? 'A' : pb > pa ? 'B' : 'Empate';

    const newMatch = {
      date: new Date().toISOString(),
      teamA,
      teamB,
      winner,
      result: `${pa}-${pb}`,
    };

    const data = await AsyncStorage.getItem(`data-${groupName}`);
    const parsed = data ? JSON.parse(data) : { players: [], matches: [] };
    parsed.matches.push(newMatch);
    await AsyncStorage.setItem(`data-${groupName}`, JSON.stringify(parsed));
    navigation.goBack();
  };

  const renderPlayerSelector = (team, setter, otherTeam) => (
    <View>
      {players.map(player => (
        <TouchableOpacity
          key={player}
          onPress={() => togglePlayer(player, setter, team, otherTeam)}
          style={[
            styles.listItem,
            team.includes(player) && styles.listItemSelected,
          ]}
        >
          <Text style={styles.playerText}>{player}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Partida</Text>

      {/* Pareja A */}
      <Text style={styles.sectionTitle}>Pareja A</Text>
      <Button
        title={showTeamAList ? 'Ocultar jugadores' : 'Elegir pareja'}
        onPress={() => setShowTeamAList(!showTeamAList)}
      />
      {showTeamAList && renderPlayerSelector(teamA, setTeamA, teamB)}
      {teamA.length > 0 && (
        <Text style={styles.selectedText}>
          Seleccionados: {teamA.join(' y ')}
        </Text>
      )}

      {/* Pareja B */}
      <Text style={styles.sectionTitle}>Pareja B</Text>
      <Button
        title={showTeamBList ? 'Ocultar jugadores' : 'Elegir pareja'}
        onPress={() => setShowTeamBList(!showTeamBList)}
      />
      {showTeamBList && renderPlayerSelector(teamB, setTeamB, teamA)}
      {teamB.length > 0 && (
        <Text style={styles.selectedText}>
          Seleccionados: {teamB.join(' y ')}
        </Text>
      )}

      {/* Puntos */}
      <Text style={styles.sectionTitle}>Puntos</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreBox}>
          <Text>A</Text>
          <TextInput
            keyboardType="numeric"
            value={pointsA}
            onChangeText={setPointsA}
            style={styles.input}
          />
        </View>
        <View style={styles.scoreBox}>
          <Text>B</Text>
          <TextInput
            keyboardType="numeric"
            value={pointsB}
            onChangeText={setPointsB}
            style={styles.input}
          />
        </View>
      </View>

      <Button title="Guardar partida" onPress={saveMatch} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  listItemSelected: {
    backgroundColor: '#c0ffc0',
  },
  playerText: {
    fontSize: 16,
  },
  selectedText: {
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
    color: '#444',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  scoreBox: {
    alignItems: 'center',
    width: '40%',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    width: '100%',
    textAlign: 'center',
  },
});
