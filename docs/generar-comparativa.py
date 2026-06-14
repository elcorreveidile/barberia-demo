from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

LIME=colors.Color(132/255,204/255,22/255); LIMED=colors.Color(90/255,150/255,10/255)
INK=colors.Color(20/255,20/255,20/255); GRAY=colors.Color(90/255,90/255,90/255); WHITE=colors.white
W,H=A4; M=15*mm; CW=W-2*M
c=canvas.Canvas("/tmp/comparativa.pdf", pagesize=A4)
def text(x,y,s,f="Helvetica",sz=10,col=INK): c.setFillColor(col); c.setFont(f,sz); c.drawString(x,y,s)
def ctext(x,y,s,f="Helvetica",sz=10,col=INK): c.setFillColor(col); c.setFont(f,sz); c.drawCentredString(x,y,s)
def rtext(x,y,s,f="Helvetica",sz=10,col=INK): c.setFillColor(col); c.setFont(f,sz); c.drawRightString(x,y,s)
def para(x,y,s,sz=8.8,col=GRAY,ld=12,width=CW,f="Helvetica"):
    c.setFillColor(col); c.setFont(f,sz)
    for ln in s.split("\n"):
        for w in simpleSplit(ln,f,sz,width): c.drawString(x,y,w); y-=ld
        y-=2
    return y

# Header
c.setFillColor(INK); c.rect(0,H-34*mm,W,34*mm,fill=1,stroke=0)
text(M,H-18*mm,"POR 2 DUROS","Helvetica-Bold",20,WHITE)
text(M,H-26*mm,"El mismo proyecto, dos precios.","Helvetica",10,LIME)
rtext(W-M,H-20*mm,"COMPARATIVA DE VALOR","Helvetica-Bold",13,WHITE)

y=H-44*mm
y=para(M,y,"Proyecto: web-app de reservas para barbería con panel de gestión, área de cliente y chatbot de WhatsApp con IA. Mismo entregable, valorado a precio de mercado frente al precio de POR 2 DUROS.",9.5,GRAY,12.5)

# Two boxes
y-=4; bh=30*mm; gap=8; bw=(CW-gap)/2
# Box A market
c.setFillColor(colors.Color(0.96,0.96,0.96)); c.setStrokeColor(colors.Color(0.8,0.8,0.8)); c.setLineWidth(1)
c.rect(M,y-bh,bw,bh,fill=1,stroke=1)
text(M+5,y-8*mm,"A precio de mercado","Helvetica-Bold",10.5,INK)
text(M+5,y-15*mm,"(agencia / freelance senior)","Helvetica",8.5,GRAY)
text(M+5,y-24*mm,"15.000 – 18.000 €","Helvetica-Bold",16,INK)
text(M+5,y-29*mm,"rango 13.000 – 24.000 €","Helvetica",8,GRAY)
# Box B P2D
bx=M+bw+gap
c.setFillColor(INK); c.rect(bx,y-bh,bw,bh,fill=1,stroke=0)
text(bx+5,y-8*mm,"Con POR 2 DUROS","Helvetica-Bold",10.5,LIME)
text(bx+5,y-15*mm,"pago único","Helvetica",8.5,WHITE)
text(bx+5,y-24*mm,"2.235 €","Helvetica-Bold",16,LIME)
text(bx+5,y-29*mm,"+ mantenimiento desde 29 €/mes","Helvetica",8,WHITE)
y=y-bh-8

# Savings banner
c.setFillColor(LIME); c.rect(M,y-11*mm,CW,11*mm,fill=1,stroke=0)
ctext(W/2,y-7.2*mm,"Ahorras  ≈ 86 %  (unos 14.000 €)  por el mismo entregable","Helvetica-Bold",12,INK)
y=y-11*mm-8

# Table header
text(M,y,"Desglose por módulos","Helvetica-Bold",11,INK); y-=6
c.setStrokeColor(LIME); c.setLineWidth(1.4); c.line(M,y,M+45*mm,y); y-=12
text(M,y,"Módulo","Helvetica-Bold",9,GRAY)
rtext(M+CW-22*mm,y,"Precio de mercado","Helvetica-Bold",9,GRAY)
rtext(W-M,y,"Incluido","Helvetica-Bold",9,GRAY); y-=6
c.setStrokeColor(colors.Color(0.85,0.85,0.85)); c.setLineWidth(0.5); c.line(M,y,W-M,y); y-=9

rows=[
 ("Web pública + diseño UI / marca","2.700 – 4.800 €"),
 ("Reserva online + anti-solapamiento (BD)","2.500 – 4.500 €"),
 ("Panel de administración","2.000 – 3.500 €"),
 ("Área de cliente","800 – 1.500 €"),
 ("Emails transaccionales","500 – 900 €"),
 ("Bot de WhatsApp con IA","3.000 – 6.000 €"),
 ("Imágenes profesionales / IA","800 – 1.800 €"),
 ("Despliegue + QA + puesta en marcha","700 – 1.300 €"),
]
for t,p in rows:
    text(M,y,t,"Helvetica",9,INK)
    rtext(M+CW-22*mm,y,p,"Helvetica",9,INK)
    rtext(W-M,y,"Sí","Helvetica-Bold",9,LIMED)
    y-=10.5
y-=2
c.setStrokeColor(colors.Color(0.85,0.85,0.85)); c.line(M,y,W-M,y); y-=8
text(M,y,"TOTAL","Helvetica-Bold",10,INK)
rtext(M+CW-22*mm,y,"13.000 – 24.000 €","Helvetica-Bold",10,INK)
rtext(W-M,y,"2.235 €","Helvetica-Bold",10,LIMED); y-=12

y=para(M,y,"Mismo producto en ambos casos. La diferencia es el modelo: POR 2 DUROS trabaja por volumen y entrega rápida, no por horas — por eso el cliente recibe por 2.235 € lo que en el mercado cuesta 15.000 €+.",8.8,INK,12)
y=para(M,y,"Costes de terceros aparte (del cliente, según uso): dominio, WhatsApp Business API e IA del bot. Alojamiento y base de datos arrancan en planes gratuitos. Precios sin IVA (21 % no incluido).",8.2,GRAY,11)

c.showPage(); c.save(); print("OK")
