import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_driver/driver_extension.dart';
import 'package:budget_app/main.dart' as app;
import 'package:budget_app/ui/statement_import_flow.dart';

void main() {
  enableFlutterDriverExtension(
    handler: (message) async {
      if (message != null && message.startsWith('upload:')) {
        final path = message.substring(7);
        final name = path.split(r'\').last;
        importStatementJobs(app.siteNavKey.currentContext!, app.siteLedger!, [
          StatementImportJob(name: name, read: () => File(path).readAsBytes()),
        ]);
        return 'ok';
      }
      if (message == 'clearsnack') {
        ScaffoldMessenger.maybeOf(app.siteNavKey.currentContext!)
            ?.clearSnackBars();
        return 'ok';
      }
      if (message == 'pop') {
        await app.siteNavKey.currentState?.maybePop();
        return 'ok';
      }
      return 'unknown';
    },
  );
  app.main();
}
