import 'package:socket_io_client/socket_io_client.dart';

class ApiSubscription {
  ApiSubscription(this.socket, this.endpoint, this.handler);

  final Socket socket;
  final String endpoint;
  final void Function(dynamic) handler;

  void subscribe() {
    socket.on(endpoint, handler);
  }

  void unsubscribe() {
    socket.off(endpoint, handler);
  }
}
