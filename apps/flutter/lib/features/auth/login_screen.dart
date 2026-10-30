import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/dialogs/dialogs.dart';
import 'package:motor/motor.dart';

import 'auth_provider.dart';

class LoginScreen extends HookConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usernameController = useTextEditingController();
    final emailController = useTextEditingController();
    final passwordController = useTextEditingController();
    final confirmPasswordController = useTextEditingController();
    final selectedTabIndex = useState(0);

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
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
                      'Get to Your Account',
                      style: context.textTheme.headlineMedium,
                    ),
                    const M3EDivider(),
                    M3ETabs(
                      tabs: const [
                        M3ETab(label: 'Sign in'),
                        M3ETab(label: 'Sign up'),
                      ],
                      selectedIndex: selectedTabIndex.value,
                      onTabSelected: (index) {
                        selectedTabIndex.value = index;
                      },
                    ),
                    SingleMotionBuilder(
                      value: selectedTabIndex.value == 0 ? 144 : 288,
                      motion:
                          const MaterialSpringMotion.expressiveSpatialDefault(),
                      builder: (context, height, child) => SizedBox(
                        height: height,
                        child: M3ETabsView(
                          selectedIndex: selectedTabIndex.value,
                          onTabSelected: (index) {
                            selectedTabIndex.value = index;
                          },
                          children: [
                            OverflowBox(
                              maxHeight: double.infinity,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: AutofillGroup(
                                  child: Column(
                                    spacing: 16,
                                    children: [
                                      TextField(
                                        key: const ValueKey('email_field'),
                                        controller: emailController,
                                        decoration: const InputDecoration(
                                          prefixIcon: Icon(
                                            Symbols.email_rounded,
                                            fill: 1,
                                          ),
                                          filled: true,
                                          border: OutlineInputBorder(),
                                          labelText: 'Email',
                                        ),
                                        keyboardType:
                                            TextInputType.emailAddress,
                                        autofillHints: const [
                                          AutofillHints.email,
                                        ],
                                        textInputAction: TextInputAction.next,
                                      ),
                                      TextField(
                                        key: const ValueKey('password_field'),
                                        controller: passwordController,
                                        decoration: const InputDecoration(
                                          prefixIcon: Icon(
                                            Symbols.lock_rounded,
                                            fill: 1,
                                          ),
                                          filled: true,
                                          border: OutlineInputBorder(),
                                          labelText: 'Password',
                                        ),
                                        obscureText: true,
                                        keyboardType:
                                            TextInputType.visiblePassword,
                                        autofillHints: const [
                                          AutofillHints.password,
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            OverflowBox(
                              maxHeight: double.infinity,
                              child: Padding(
                                padding: const EdgeInsets.all(8),
                                child: AutofillGroup(
                                  child: Column(
                                    spacing: 16,
                                    children: [
                                      TextField(
                                        key: const ValueKey('username_field'),
                                        controller: usernameController,
                                        decoration: const InputDecoration(
                                          prefixIcon: Icon(
                                            Symbols.person_filled_rounded,
                                            fill: 1,
                                          ),
                                          filled: true,
                                          border: OutlineInputBorder(),
                                          labelText: 'Username',
                                        ),
                                        keyboardType: TextInputType.name,
                                        autofillHints: const [
                                          AutofillHints.newUsername,
                                        ],
                                        textInputAction: TextInputAction.next,
                                      ),
                                      TextField(
                                        key: const ValueKey('email_field'),
                                        controller: emailController,
                                        decoration: const InputDecoration(
                                          prefixIcon: Icon(
                                            Symbols.email_rounded,
                                            fill: 1,
                                          ),
                                          filled: true,
                                          border: OutlineInputBorder(),
                                          labelText: 'Email',
                                        ),
                                        keyboardType:
                                            TextInputType.emailAddress,
                                        autofillHints: const [
                                          AutofillHints.email,
                                        ],
                                        textInputAction: TextInputAction.next,
                                      ),
                                      TextField(
                                        key: const ValueKey('password_field'),
                                        controller: passwordController,
                                        decoration: const InputDecoration(
                                          prefixIcon: Icon(
                                            Symbols.lock_rounded,
                                            fill: 1,
                                          ),
                                          filled: true,
                                          border: OutlineInputBorder(),
                                          labelText: 'Password',
                                        ),
                                        obscureText: true,
                                        keyboardType:
                                            TextInputType.visiblePassword,
                                        autofillHints: const [
                                          AutofillHints.newPassword,
                                        ],
                                        textInputAction: TextInputAction.next,
                                      ),
                                      TextField(
                                        key: const ValueKey(
                                          'confirm_password_field',
                                        ),
                                        controller: confirmPasswordController,
                                        decoration: const InputDecoration(
                                          prefixIcon: Icon(
                                            Symbols.key_rounded,
                                            fill: 1,
                                          ),
                                          filled: true,
                                          border: OutlineInputBorder(),
                                          labelText: 'Confirm password',
                                        ),
                                        obscureText: true,
                                        keyboardType:
                                            TextInputType.visiblePassword,
                                        autofillHints: const [
                                          AutofillHints.newPassword,
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Divider(),
                    Align(
                      alignment: Alignment.centerRight,
                      child: M3EIconButton(
                        icon: const Icon(Symbols.arrow_right_alt_rounded),
                        size: M3EIconButtonSize.md,
                        onPressed: () {
                          TextInput.finishAutofillContext();
                          print(selectedTabIndex.value);

                          if (selectedTabIndex.value == 0)
                            ref
                                .read(authProvider.notifier)
                                .login(
                                  email: emailController.text,
                                  password: passwordController.text,
                                );
                          else if (selectedTabIndex.value == 1) {
                            if (passwordController.text !=
                                confirmPasswordController.text)
                              return showError('Passwords don\'t match');

                            ref
                                .read(authProvider.notifier)
                                .register(
                                  email: emailController.text,
                                  username: usernameController.text,
                                  password: passwordController.text,
                                );
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
