import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatsScreen({ route }) {
  const { groupName } = route.params;
  const [playerStats, setPlayerStats] = useState([]);
  const [pairStats, setPairStats] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0); // nuevo estado

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await AsyncStorage.getItem(`data-${groupName}`);
    if (!data) return;

    const parsed = JSON.parse(data);
    const players = parsed.players || [];
    const matches = parsed.matches || [];

    setTotalMatches(matches.length); // ← guardar total de partidas

    // Estadísticas individuales
    const playerData = players.map(player => {
      let wins = 0;
      let losses = 0;

      matches.forEach(match => {
        const isWinner =
          (match.winner === 'A' && match.teamA.includes(player)) ||
          (match.winner === 'B' && match.teamB.includes(player));
        const isLoser =
          (match.winner === 'A' && match.teamB.includes(player)) ||
          (match.winner === 'B' && match.teamA.includes(player));

        if (isWinner) wins++;
        else if (isLoser) losses++;
      });

      const total = wins + losses;
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '—';

      return {
        player,
        winRate,
        wins,
        losses,
        total,
      };
    });

    setPlayerStats(playerData.sort((a, b) => b.winRate - a.winRate));

    // Estadísticas por pareja
    const pairMap = {};

    matches.forEach(match => {
      const pairs = [match.teamA, match.teamB];
      pairs.forEach((team, i) => {
        const sortedTeam = [...team].sort();
        const key = sortedTeam.join(' & ');

        if (!pairMap[key]) {
          pairMap[key] = { wins: 0, total: 0 };
        }

        const won = (i === 0 && match.winner === 'A') || (i === 1 && match.winner === 'B');
        if (won) pairMap[key].wins++;
        pairMap[key].total++;
      });
    });

    const pairArray = Object.entries(pairMap).map(([pair, { wins, total }]) => {
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '—';
      return {
        pair,
        winRate,
        total,
      };
    });

    setPairStats(pairArray.sort((a, b) => b.winRate - a.winRate));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas - {groupName}</Text>

      {/* Tabla de jugadores */}
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.bold]}>Jugador</Text>
        <Text style={[styles.cell, styles.bold]}>% Victorias</Text>
        <Text style={[styles.cell, styles.bold]}>V / D</Text>
        <Text style={[styles.cell, styles.bold]}>Partidas</Text>
      </View>

      <FlatList
        data={playerStats}
        keyExtractor={(item) => item.player}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.player}</Text>
            <Text style={styles.cell}>{item.winRate}</Text>
            <Text style={styles.cell}>{item.wins} / {item.losses}</Text>
            <Text style={styles.cell}>{item.total}</Text>
          </View>
        )}
      />

      {/* NUEVO: contador de partidas */}
      <Text style={styles.totalText}>Partidas totales jugadas: {totalMatches}</Text>

      {/* Tabla de parejas */}
      <Text style={styles.subtitle}>Todas las parejas</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.bold]}>Pareja</Text>
        <Text style={[styles.cell, styles.bold]}>% Victorias</Text>
        <Text style={[styles.cell, styles.bold]}>Partidas</Text>
      </View>

      <FlatList
        data={pairStats}
        keyExtractor={(item) => item.pair}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.pair}</Text>
            <Text style={styles.cell}>{item.winRate}</Text>
            <Text style={styles.cell}>{item.total}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 10 }}>Aún no hay parejas registradas</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
});
