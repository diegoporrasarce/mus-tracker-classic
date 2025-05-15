import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddPlayersScreen({ route, navigation }) {
  const { groupName } = route.params;
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');

  const addPlayer = () => {
    if (!newPlayer || players.includes(newPlayer)) return;
    setPlayers([...players, newPlayer]);
    setNewPlayer('');
  };

  const deletePlayer = (name) => {
    setPlayers(players.filter(p => p !== name));
  };

  const finishSetup = async () => {
    if (players.length < 4) {
      Alert.alert('Debes añadir al menos 4 jugadores para jugar Mus');
      return;
    }

    await AsyncStorage.setItem(`data-${groupName}`, JSON.stringify({
      players,
      matches: []
    }));

    const groups = await AsyncStorage.getItem('musGroups');
    const parsed = groups ? JSON.parse(groups) : [];
    if (!parsed.includes(groupName)) {
      parsed.push(groupName);
      await AsyncStorage.setItem('musGroups', JSON.stringify(parsed));
    }

    navigation.replace('Grupo', { name: groupName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores para "{groupName}"</Text>

      <TextInput
        placeholder="Nombre del jugador"
        value={newPlayer}
        onChangeText={setNewPlayer}
        style={styles.input}
      />
      <Button title="Añadir jugador" onPress={addPlayer} />

      <FlatList
        data={players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => deletePlayer(item)}>
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 10 }}>Sin jugadores</Text>}
        style={{ marginTop: 20 }}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="Guardar grupo" onPress={finishSetup} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 10, paddingBottom: 80, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  deleteText: {
    fontSize: 18,
    color: 'black',
    paddingHorizontal: 10,
  },
});
