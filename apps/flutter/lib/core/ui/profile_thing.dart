import 'package:flutter/material.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:min_flutter/core/theme_ext.dart';

enum ProfileThingType {
  top('top'),
  normal('normal'),
  bottom('bottom');

  final String value;
  const ProfileThingType(this.value);
}

class ProfileThing extends StatelessWidget {
  final ProfileThingType? type;
  final String? name;
  final String? undername;
  final VoidCallback? onTap;

  const ProfileThing({
    super.key,
    this.type,
    this.name,
    this.undername,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.only(
      topLeft: Radius.circular(type == ProfileThingType.top ? 24 : 8),
      topRight: Radius.circular(type == ProfileThingType.top ? 24 : 8),
      bottomLeft: Radius.circular(type == ProfileThingType.bottom ? 24 : 8),
      bottomRight: Radius.circular(type == ProfileThingType.bottom ? 24 : 8),
    );

    return Padding(
      padding: EdgeInsets.only(
        top: type == ProfileThingType.top ? 8 : 2,
        bottom: type == ProfileThingType.bottom ? 8 : 2,
        left: 4,
        right: 4,
      ),
      child: Container(
        width: double.infinity,
        height: 80,
        decoration: ShapeDecoration(
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
        ),
        child: Material(
          color: context.colorScheme.surfaceContainer,
          elevation: 1,
          shadowColor: context.colorScheme.shadow,
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap ?? () {},
            splashColor: context.colorScheme.primary.withValues(alpha: 0.12),
            highlightColor: context.colorScheme.primary.withValues(alpha: 0.04),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                spacing: 8,
                children: [
                  const CircleAvatar(
                    radius: 24,
                    child: Icon(Symbols.account_circle_rounded, size: 32),
                  ),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name ?? "Test User",
                          style: context.textTheme.bodyLarge,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          undername ?? "@test_user",
                          style: context.textTheme.bodyMedium?.copyWith(
                            color: context.colorScheme.secondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
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
