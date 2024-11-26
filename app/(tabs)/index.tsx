import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Produto {
  nome: string;
  quantidade: number;
}

interface Pedido {
  id: string;
  nomeCliente: string;
  produtos: Produto[];
  data: string;
}

export default function App() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtosDoPedido, setProdutosDoPedido] = useState<Produto[]>([]);
  const [mostrarPedidos, setMostrarPedidos] = useState(false);

  // Carregar pedidos armazenados no AsyncStorage quando o app for iniciado
  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        const pedidosSalvos = await AsyncStorage.getItem('pedidos');
        if (pedidosSalvos) {
          setPedidos(JSON.parse(pedidosSalvos));
        }
      } catch (error) {
        console.log("Erro ao carregar pedidos:", error);
      }
    };
    carregarPedidos();
  }, []);

  // Função para adicionar produto à lista do pedido
  const adicionarProduto = () => {
    if (!produtoNome || !quantidade) return;

    const novoProduto: Produto = {
      nome: produtoNome,
      quantidade: parseInt(quantidade),
    };

    setProdutosDoPedido((prevProdutos) => [...prevProdutos, novoProduto]);
    setProdutoNome('');
    setQuantidade('');
  };

  // Função para adicionar o pedido à lista e salvar no AsyncStorage
  const adicionarPedido = async () => {
    if (!nomeCliente || produtosDoPedido.length === 0) return;

    const dataAtual = new Date().toLocaleString();
    const novoPedido: Pedido = {
      id: Date.now().toString(),
      nomeCliente,
      produtos: produtosDoPedido,
      data: dataAtual,
    };

    const pedidosAtualizados = [...pedidos, novoPedido];

    try {
      // Salvar os pedidos no AsyncStorage
      await AsyncStorage.setItem('pedidos', JSON.stringify(pedidosAtualizados));
      setPedidos(pedidosAtualizados);
    } catch (error) {
      console.log("Erro ao salvar pedido:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o pedido.');
    }

    setNomeCliente('');
    setProdutosDoPedido([]);
  };

  // Função para remover um pedido
  const removerPedido = async (idPedido: string) => {
    try {
      // Filtra os pedidos para remover o pedido com o id específico
      const pedidosAtualizados = pedidos.filter(pedido => pedido.id !== idPedido);

      // Atualiza o AsyncStorage
      await AsyncStorage.setItem('pedidos', JSON.stringify(pedidosAtualizados));

      // Atualiza o estado
      setPedidos(pedidosAtualizados);
      Alert.alert('Pedido removido', 'O pedido foi removido com sucesso.');
    } catch (error) {
      console.log("Erro ao remover pedido:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao remover o pedido.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Pedido</Text>

      {/* Campo para nome do cliente */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Cliente"
        value={nomeCliente}
        onChangeText={setNomeCliente}
      />

      {/* Campos para adicionar produtos */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={produtoNome}
        onChangeText={setProdutoNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <Button title="Adicionar Produto" onPress={adicionarProduto} />

      {/* Lista de produtos adicionados ao pedido */}
      <FlatList
        data={produtosDoPedido}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.produto}>
            <Text>{item.nome} - Quantidade: {item.quantidade}</Text>
          </View>
        )}
      />

      {/* Botão para adicionar o pedido */}
      <Button title="Adicionar Pedido" onPress={adicionarPedido} />

      {/* Seção de Pedidos */}
      <TouchableOpacity onPress={() => setMostrarPedidos(!mostrarPedidos)}>
        <Text style={styles.pedidosTitle}>Pedidos</Text>
      </TouchableOpacity>

      {/* Lista de pedidos salvos, visível quando mostrarPedidos for true */}
      {mostrarPedidos && (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.pedido}>
              <Text>{item.nomeCliente}</Text>
              <Text>{item.data}</Text>
              {item.produtos.map((produto, index) => (
                <Text key={index}>{produto.nome} - Quantidade: {produto.quantidade}</Text>
              ))}
              <Button
                title="Remover Pedido"
                onPress={() => removerPedido(item.id)} // Remove o pedido ao clicar no botão
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  produto: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  pedido: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  pedidosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007bff',
  },
});
