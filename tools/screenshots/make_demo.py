"""Synthetic HDFC-format savings statement for public screenshots. All names invented."""
import csv
import datetime as dt
import os
import random

random.seed(7)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'demo_statement.csv')
START = dt.date(2025, 10, 1)
END = dt.date(2026, 9, 26)

rows = []  # (date, narration, withdrawal, deposit)
ref_n = [512000000000]


def ref():
    ref_n[0] += random.randint(1000, 90000)
    return str(ref_n[0])


def upi(name, vpa, note='PAYMENT FROM PHONE'):
    return f'UPI-{name}-{vpa}-{random.choice(["HDFC0MERUPI", "ICIC0DC0099", "YESB0PTMUPI", "UTIB0000553"])}-{ref()}-{note}'


def add(d, narr, w=None, dep=None):
    if START <= d <= END:
        rows.append((d, narr, w, dep))


def day(y, m, d):
    import calendar
    return dt.date(y, m, min(d, calendar.monthrange(y, m)[1]))


months = []
y, m = START.year, START.month
while (y, m) <= (END.year, END.month):
    months.append((y, m))
    m += 1
    if m == 13:
        y, m = y + 1, 1

ON_THE_DAY = [
    ('SWIGGY', 'swiggy@icici', (180, 850), 'food'),
    ('ZOMATO LIMITED', 'zomato-order@ptybl', (220, 950), 'food'),
    ('BLINKIT', 'blinkit.payu@hdfcbank', (240, 2400), 'grocery'),
    ('ZEPTO MARKETPLACE PVT', 'zepto@ybl', (180, 1600), 'grocery'),
    ('BIGBASKET', 'bigbasket@razorpay', (900, 3200), 'grocery'),
    ('UBER INDIA SYSTEMS P', 'uber.rides@hdfcbank', (110, 620), 'cab'),
    ('RAPIDO', 'rapido.bike@axisbank', (60, 220), 'cab'),
    ('BLUE TOKAI COFFEE ROA', 'bluetokai@icici', (240, 520), 'cafe'),
    ('THIRD WAVE COFFEE', 'thirdwave@ybl', (220, 480), 'cafe'),
]

for (y, m) in months:
    # Salary, rent, family, SIP, bills.
    add(day(y, m, 1), f'NEFT CR-CITI0000002-NORTHWIND SOFTWARE PVT LTD-AARAV MEHTA-SALARY {dt.date(y, m, 1):%b %Y}'.upper(), dep=128500)
    add(day(y, m, 3), upi('SUNITA KAPOOR', 'sunitakapoor@okhdfcbank', f'RENT {dt.date(y, m, 1):%b}'.upper()), w=32000)
    add(day(y, m, 5), upi('MUMMY', 'kavita.mehta@oksbi', 'HOME'), w=10000)
    add(day(y, m, 7), upi('ZERODHA BROKING LTD', 'zerodhabroking@hdfcbank', 'SIP'), w=20000)
    add(day(y, m, 10), upi('GROWW INVEST TECH', 'groww.mf@axisbank', 'MF SIP'), w=5000)
    add(day(y, m, 12), upi('NETFLIX COM', 'netflix@hdfcbank', 'AUTOPAY'), w=649)
    add(day(y, m, 14), upi('SPOTIFY INDIA PVT LT', 'spotify@hdfcbank', 'AUTOPAY'), w=139)
    add(day(y, m, 18), upi('AIRTEL BROADBAND', 'airtelbroadband@icici', 'BILL'), w=1179)
    elec = random.randint(1150, 2650) + (700 if m in (4, 5, 6) else 0)
    add(day(y, m, 20), upi('BESCOM', 'bescom.billdesk@hdfcbank', 'ELECTRICITY'), w=elec)
    add(day(y, m, 25), upi('CULT FIT', 'cultfit@razorpay', 'MEMBERSHIP'), w=1499)

    # Everyday spends.
    for d in range(1, 32):
        try:
            date = dt.date(y, m, d)
        except ValueError:
            break
        for name, vpa, (lo, hi), kind in ON_THE_DAY:
            p = {'food': 0.22, 'grocery': 0.11, 'cab': 0.2, 'cafe': 0.1}[kind]
            if name == 'BIGBASKET':
                p = 0.03
            if random.random() < p:
                add(date, upi(name, vpa), w=random.randint(lo, hi))
    # Shopping, fun, health, travel.
    for _ in range(random.randint(2, 4)):
        store = random.choice(['AMAZON PAY INDIA', 'MYNTRA DESIGNS', 'FLIPKART INTERNET', 'DECATHLON SPORTS'])
        add(day(y, m, random.randint(1, 28)), f'POS 416021XXXXXX4321 {store}', w=random.randint(499, 5200))
    if random.random() < 0.8:
        add(day(y, m, random.randint(6, 27)), upi('BOOKMYSHOW', 'bookmyshow@icici', 'MOVIE'), w=random.choice([580, 760, 1140, 1320]))
    if random.random() < 0.5:
        add(day(y, m, random.randint(1, 28)), upi('TATA 1MG HEALTHCARE', '1mg@hdfcbank'), w=random.randint(240, 1900))
    if random.random() < 0.35:
        add(day(y, m, random.randint(1, 28)), f'POS 416021XXXXXX4321 INDIGO AIRLINES', w=random.randint(4200, 11800))
    if random.random() < 0.6:
        add(day(y, m, random.randint(1, 28)), 'POS 416021XXXXXX4321 INDIAN OIL PETROL PUMP', w=random.randint(900, 2600))
    # Friends.
    for friend, vpa in [('ROHAN VERMA', 'rohanverma@okaxis'), ('NEHA IYER', 'neha.iyer@ybl')]:
        if random.random() < 0.6:
            add(day(y, m, random.randint(1, 28)), upi(friend, vpa, 'DINNER SPLIT'), w=random.randint(300, 1800))
        if random.random() < 0.3:
            add(day(y, m, random.randint(1, 28)), upi(friend, vpa, 'PAID BACK'), dep=random.randint(250, 1500))
    if m in (3, 10):
        add(day(y, m, 15), 'NEFT CR-CITI0000002-NORTHWIND SOFTWARE PVT LTD-AARAV MEHTA-PERFORMANCE BONUS', dep=85000)
    if random.random() < 0.3:
        add(day(y, m, 28), f'CREDIT INTEREST CAPITALISED', dep=random.randint(600, 1400))

rows.sort(key=lambda r: (r[0], r[3] is None))
bal = 212480.35
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['Date', 'Narration', 'Chq./Ref.No.', 'Value Dt', 'Withdrawal Amt.', 'Deposit Amt.', 'Closing Balance'])
    for d, narr, wd, dep in rows:
        bal += (dep or 0) - (wd or 0)
        ds = d.strftime('%d/%m/%y')
        w.writerow([ds, narr, '0000' + ref(), ds, wd if wd else '', dep if dep else '', f'{bal:.2f}'])
print(len(rows), 'rows, closing', round(bal, 2), OUT)
