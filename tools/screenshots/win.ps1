param(
  [Parameter(Mandatory)] [ValidateSet('resize','capture')] [string]$Action,
  [string]$Out,
  [string]$Text,
  [int]$W = 412,
  [int]$H = 892
)
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class W32 {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int w, int hh, uint f);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint f);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr FindWindow(string cls, string title);
}
"@
[W32]::SetProcessDPIAware() | Out-Null

$hwnd = [W32]::FindWindow('FLUTTER_RUNNER_WIN32_WINDOW', [NullString]::Value)
if ($hwnd -eq [IntPtr]::Zero) { throw 'app window not found' }

switch ($Action) {
  'resize' {
    $scale = [W32]::GetDpiForWindow($hwnd) / 96.0
    [W32]::ShowWindow($hwnd, 9) | Out-Null
    $tw = [int]($W * $scale); $th = [int]($H * $scale)
    $ww = $tw; $wh = $th
    for ($i = 0; $i -lt 4; $i++) {
      [W32]::SetWindowPos($hwnd, [IntPtr]::Zero, 40, 10, $ww, $wh, 0x0040) | Out-Null
      Start-Sleep -Milliseconds 300
      $cr = New-Object W32+RECT
      [W32]::GetClientRect($hwnd, [ref]$cr) | Out-Null
      $ww += $tw - $cr.R; $wh += $th - $cr.B
      if ($cr.R -eq $tw -and $cr.B -eq $th) { break }
    }
    [W32]::SetForegroundWindow($hwnd) | Out-Null
    "client=$($cr.R)x$($cr.B)"
    "scale=$scale"
  }
  'capture' {
    $cr = New-Object W32+RECT
    [W32]::GetClientRect($hwnd, [ref]$cr) | Out-Null
    $wr = New-Object W32+RECT
    [W32]::GetWindowRect($hwnd, [ref]$wr) | Out-Null
    $pt = New-Object W32+POINT
    [W32]::ClientToScreen($hwnd, [ref]$pt) | Out-Null
    $full = New-Object System.Drawing.Bitmap ($wr.R - $wr.L), ($wr.B - $wr.T)
    $g = [System.Drawing.Graphics]::FromImage($full)
    $hdc = $g.GetHdc()
    [W32]::PrintWindow($hwnd, $hdc, 2) | Out-Null
    $g.ReleaseHdc($hdc); $g.Dispose()
    $rect = New-Object System.Drawing.Rectangle ($pt.X - $wr.L), ($pt.Y - $wr.T), $cr.R, $cr.B
    $bmp = $full.Clone($rect, $full.PixelFormat)
    $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose(); $full.Dispose()
    "saved $Out"
  }
}
