from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

LIME=colors.Color(132/255,204/255,22/255)
LIMED=colors.Color(90/255,150/255,10/255)
INK=colors.Color(20/255,20/255,20/255)
GRAY=colors.Color(90/255,90/255,90/255)
WHITE=colors.white
W,H=A4
M=15*mm; CW=W-2*M
c=canvas.Canvas("/tmp/presupuesto.pdf", pagesize=A4)

def text(x,y,s,font="Helvetica",size=10,color=INK):
    c.setFillColor(color); c.setFont(font,size); c.drawString(x,y,s)
def rtext(x,y,s,font="Helvetica",size=10,color=INK):
    c.setFillColor(color); c.setFont(font,size); c.drawRightString(x,y,s)
def para(x,y,s,size=8.8,color=GRAY,leading=12,width=CW,font="Helvetica"):
    c.setFillColor(color); c.setFont(font,size)
    for line in s.split("\n"):
        for w in simpleSplit(line,font,size,width):
            c.drawString(x,y,w); y-=leading
        y-=2
    return y

y=H
# Header band
c.setFillColor(INK); c.rect(0,H-34*mm,W,34*mm,fill=1,stroke=0)
text(M,H-18*mm,"POR 2 DUROS","Helvetica-Bold",20,WHITE)
text(M,H-26*mm,"Precio transparente. Sin sorpresas.","Helvetica",10,LIME)
rtext(W-M,H-20*mm,"PRESUPUESTO","Helvetica-Bold",15,WHITE)

y=H-44*mm
y=para(M,y,"Cliente: [Nombre de la barbería]\nProyecto: Web-app de reservas para barbería y estética masculina\nFecha: 14/06/2026     Validez: 30 días",9.5,GRAY,12.5)

def seccion(t,y):
    y-=4
    text(M,y,t,"Helvetica-Bold",11,INK); y-=4
    c.setStrokeColor(LIME); c.setLineWidth(1.4); c.line(M,y,M+40*mm,y); y-=11
    return y

def item(t,det,precio,y,dest=False):
    text(M,y,t,"Helvetica-Bold",10.5,INK)
    rtext(W-M,y,precio,"Helvetica-Bold",10.5,LIMED if dest else INK); y-=12
    y=para(M,y,det,8.8,GRAY,11.5); 
    return y-2

y=seccion("1) Proyecto base",y)
y=item("App a medida","Web pública (home, servicios, equipo, galería, contacto) + reserva online con huecos reales, anti-solapamiento y confirmación por email, + área de cliente (“Mis citas”).","1.297 €",y)

y=seccion("2) Extras incluidos",y)
y=item("Panel de contenido","Panel del negocio: gestión de citas (crear / mover / cancelar), servicios y profesionales.","+197 €",y)
y=item("Login / Registro","Acceso sin contraseña por magic link (panel del negocio y área de cliente).","+147 €",y)
y=item("SEO básico","Metadatos + imagen para compartir en redes (Open Graph).","+97 €",y)
text(M,y,"Subtotal web","Helvetica-Bold",10,INK); rtext(W-M,y,"1.738 €","Helvetica-Bold",10,INK); y-=14

y=seccion("3) Extra destacado — Chatbot de WhatsApp con IA",y)
y=item("Agente de WhatsApp (IA)","Asistente que conversa y agenda solo: entiende lenguaje natural, propone huecos reales, reserva, cancela y reprograma; conectado a la misma base de datos y anti-solapamiento; avisos al negocio y enlace de gestión para el cliente.","+497 €",y,dest=True)

# Totales box
y-=2; boxh=26*mm
c.setFillColor(INK); c.rect(M,y-boxh,CW,boxh,fill=1,stroke=0)
yy=y-7*mm
text(M+5*mm,yy,"Web + extras","Helvetica",9.5,WHITE); rtext(W-M-5*mm,yy,"1.738 €","Helvetica",9.5,WHITE); yy-=6*mm
text(M+5*mm,yy,"+ Chatbot de WhatsApp","Helvetica",9.5,WHITE); rtext(W-M-5*mm,yy,"497 €","Helvetica",9.5,WHITE); yy-=8*mm
text(M+5*mm,yy,"TOTAL PROYECTO (pago único)","Helvetica-Bold",13,LIME); rtext(W-M-5*mm,yy,"2.235 €","Helvetica-Bold",13,LIME)
y=y-boxh-8

y=para(M,y,"Sin el chatbot, el total sería 1.738 €.\nMantenimiento mensual (opcional): Básico 29 €/mes  ·  Pro 49 €/mes (recomendado con el bot: incluye monitorización del chatbot).",8.8,GRAY,12)

y=seccion("Condiciones",y)
y=para(M,y,
"Incluye: diseño a medida (estética de marca), responsive y rápido; despliegue en producción y puesta en marcha; Garantía 15 días (si no quedas satisfecho, te devolvemos el dinero, sin preguntas).\n"
"No incluido (ampliable): Pagos online (+197 €), Multidioma (+147 €), Analytics (+47 €).\n"
"Costes de terceros (del cliente, según uso): dominio (~12 €/año), WhatsApp Business API (número + conversaciones de Meta) e IA del bot (consumo por conversación). Alojamiento y base de datos arrancan en planes gratuitos.\n"
"Precios sin IVA (21 % no incluido).",8.8,INK,12)

c.showPage(); c.save(); print("OK")
