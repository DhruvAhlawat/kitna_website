// Drives the Windows build through the main flows and captures each screen
// for the marketing site. In-app only: no keystrokes or mouse input.
import 'dart:io';

import 'package:flutter_driver/flutter_driver.dart';

final scratch = Platform.environment['SHOTS_DIR']!;
final ps1 = '$scratch\\win.ps1';
final outDir = '$scratch\\${Platform.environment['SHOTS_SUB'] ?? 'shots'}';
final uploadDir = '$scratch\\${Platform.environment['UPLOAD_SUB'] ?? 'upload'}';
final compareSteps = int.parse(Platform.environment['COMPARE_STEPS'] ?? '6');

late FlutterDriver d;

Future<void> ps(List<String> args) async {
  final r = await Process.run('powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1, ...args]);
  stdout.write(r.stdout);
  stderr.write(r.stderr);
}

Future<void> wait(int ms) => Future<void>.delayed(Duration(milliseconds: ms));

Future<void> shot(String name, {int settleMs = 1000}) async {
  await wait(settleMs);
  await ps(['-Action', 'capture', '-Out', '$outDir\\$name.png']);
}

Future<bool> tap(SerializableFinder f, {int ms = 4000}) async {
  try {
    await d.runUnsynchronized(
        () => d.tap(f, timeout: Duration(milliseconds: ms)));
    await wait(700);
    return true;
  } catch (e) {
    stdout.writeln('tap failed: $f');
    return false;
  }
}

Future<void> type(String text) async {
  try {
    await d.runUnsynchronized(() => d.enterText(text));
  } catch (e) {
    stdout.writeln('enterText failed');
  }
}

Future<void> scroll(SerializableFinder f, double dy) async {
  try {
    await d.runUnsynchronized(() => d.scroll(
        f, 0, dy, const Duration(milliseconds: 400),
        timeout: const Duration(seconds: 4)));
  } catch (e) {
    stdout.writeln('scroll failed: $f');
  }
}

Future<void> back() async {
  await d.requestData('pop');
  await wait(700);
}

SerializableFinder first(SerializableFinder of) => find.descendant(
    of: find.byType('MaterialApp'), matching: of, firstMatchOnly: true);

Future<void> drawer(String key) async {
  await tap(find.byValueKey('home-menu'));
  await tap(find.byValueKey(key));
  await wait(500);
}

Future<void> main() async {
  d = await FlutterDriver.connect();
  await ps(['-Action', 'resize', '-W', '412', '-H', '892']);
  await wait(2500);
  await shot('01-home-before');

  // Upload each statement through the app's own import sheet.
  final files = Directory(uploadDir).listSync().whereType<File>().toList()
    ..sort((a, b) => a.path.compareTo(b.path));
  for (var i = 0; i < files.length; i++) {
    await d.requestData('upload:${files[i].path}');
    await wait(i == 0 ? 600 : 3000);
    if (i == 0) await shot('02-import-running', settleMs: 0);
    await wait(3000);
    if (i == 0) await shot('03-import-bank');
    if (i == files.length - 1) await shot('03b-import-card');
    if (!await tap(find.byValueKey('import-sheet-done'), ms: 6000)) {
      if (!await tap(find.text('Later'), ms: 3000)) await back();
    }
  }
  await wait(1500);

  // Add sheet.
  await tap(find.byValueKey('home-add-data'));
  await shot('04-add-sheet');
  await back();

  // Home.
  await shot('05-home-this-month');
  await tap(find.text('All time'));
  await shot('06-home');
  await scroll(first(find.byType('ListView')), -600);
  await shot('07-home-list');
  await scroll(first(find.byType('ListView')), 4000);

  // Compare, stepped back to the last month with statement data.
  await tap(find.byValueKey('home-compare'));
  await tap(find.byValueKey('compare-period-Month'), ms: 2000);
  for (var i = 0; i < compareSteps; i++) {
    await tap(find.byValueKey('compare-older'), ms: 2000);
  }
  await shot('08-compare');
  await scroll(find.byType('ListView'), -450);
  await shot('09-compare-categories');
  await tap(find.byValueKey('compare-baseline-average'));
  await shot('10-compare-average');
  await tap(first(find.byValueKey('compare-row-spend-Food')), ms: 2000);
  await shot('11-compare-row');
  await back();
  await back();

  // Transaction, then a rule from it.
  await scroll(first(find.byType('ListView')), -600);
  await tap(first(find.byType('TxnRow')));
  await shot('12-transaction');
  await tap(find.byValueKey('txn-add-rule'));
  await shot('13-rule-editor');
  await back();
  await back();
  await scroll(first(find.byType('ListView')), 4000);

  // Search.
  await tap(find.byValueKey('home-search'));
  await tap(find.byValueKey('search-field'));
  await type(Platform.environment['SEARCH'] ?? 'swiggy');
  await shot('14-search');
  await back();

  // Drawer pages.
  await tap(find.byValueKey('home-menu'));
  await shot('15-drawer');
  await tap(find.byValueKey('drawer-review'));
  await shot('16-review');
  await tap(find.byValueKey('review-segment-rules'));
  await shot('17-rules');
  await back();

  await drawer('drawer-budgets');
  await shot('18-budgets-empty');
  await tap(find.byValueKey('budgets-suggest'));
  await shot('19-budgets');
  await d.requestData('clearsnack');
  await back();

  await drawer('drawer-recurring');
  await shot('20-recurring');
  await back();

  await drawer('drawer-historic');
  await shot('21-historic');
  await back();

  await drawer('drawer-upload-history');
  await shot('22-upload-history');
  await back();

  // Alerts and pasted SMS (text goes into the app's own field).
  await tap(find.byValueKey('home-add-data'));
  await tap(find.byValueKey('add-sheet-alerts'));
  await shot('23-alerts-page');
  await tap(first(find.byType('TextField')));
  await type(
    'Spent Rs.640 On HDFC Bank Card 4321 At BLUE TOKAI COFFEE On 2026-09-26:09:12:40.\n\n'
    'Spent Rs.1249 On HDFC Bank Card 4321 At BOOKMYSHOW On 2026-09-26:19:02:11.\n\n'
    'Sent Rs.350.00 From HDFC Bank A/C *4321 To RAMESH KUMAR On 27/09/26 Ref 526912345678',
  );
  await shot('24-alerts-pasted');
  await tap(find.text('Parse pasted alerts'));
  await shot('25-alerts-parsed', settleMs: 1500);
  await d.requestData('clearsnack');
  await back();

  await drawer('drawer-settings');
  await shot('26-settings');
  await back();

  // Dark theme.
  await drawer('drawer-settings');
  await tap(find.text('Dark'));
  await back();
  await shot('27-home-dark', settleMs: 1500);
  await tap(find.byValueKey('home-compare'));
  await shot('28-compare-dark');
  await back();

  await d.close();
}
