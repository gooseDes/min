import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/theme_ext.dart';

import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Card.outlined(
            color: context.colorScheme.surface,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: 16,
                children: [
                  Text(
                    "Sign in",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: context.colorScheme.onSurface,
                    ),
                  ),
                  const Divider(),
                  AutofillGroup(
                    child: Column(
                      spacing: 16,
                      children: [
                        TextField(
                          key: const ValueKey('email_field'),
                          controller: _emailController,
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Symbols.email_rounded, fill: 1),
                            filled: true,
                            border: OutlineInputBorder(),
                            labelText: "Email",
                          ),
                          keyboardType: TextInputType.emailAddress,
                          autofillHints: const [AutofillHints.email],
                          textInputAction: TextInputAction.next,
                        ),
                        TextField(
                          key: const ValueKey('password_field'),
                          controller: _passwordController,
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Symbols.lock_rounded, fill: 1),
                            filled: true,
                            border: OutlineInputBorder(),
                            labelText: "Password",
                          ),
                          obscureText: true,
                          keyboardType: TextInputType.visiblePassword,
                          autofillHints: const [AutofillHints.password],
                        ),
                      ],
                    ),
                  ),
                  const Divider(),
                  Align(
                    alignment: Alignment.centerRight,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: context.colorScheme.primary,
                        foregroundColor: context.colorScheme.onPrimary,
                      ),
                      child: const Text("Log in"),
                      onPressed: () {
                        TextInput.finishAutofillContext();
                        ref
                            .read(authProvider.notifier)
                            .login(
                              _emailController.text,
                              _passwordController.text,
                            );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
