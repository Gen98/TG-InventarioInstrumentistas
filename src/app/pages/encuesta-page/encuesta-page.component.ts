import { Component, OnInit } from '@angular/core';
import { ClienteDistribuidor } from '../../interfaces/cliente_distribuidor.interface';
import { DexieSolicitudesService } from '../../services/dexie-solicitudes.service';
import { EncuestasService } from '../../services/encuestas.service';
import Swal from 'sweetalert2';
import { Observable, Subject } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';
import { EncuestaSatisfaccion } from '../../interfaces/encuesta_satisfaccion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta-page',
  templateUrl: './encuesta-page.component.html',
  styleUrls: ['./encuesta-page.component.css']
})
export class EncuestaPageComponent implements OnInit {

  provNombre: string = '';
  clienteNombre: string = '';
  fecha: string = new Date().toLocaleDateString('en-MX');
  clientes: ClienteDistribuidor[] = [];
  clienteSeleccionado: ClienteDistribuidor;
  banMostrarEncuesta: boolean = false;
  banEncuestaFinalizada: boolean = false;
  encuesta: EncuestaSatisfaccion;
  fotoTomada: string = '.';
  private trigger: Subject<void> = new Subject<void>();
  private innerWidth: number;
  json: object = {
    "locale": "es",
    "title": "ENCUESTA DE SATISFACCION DEL CLIENTE",
    "description": {
      "default": "Estimado cliente: Nos esforzamos continuamente por conocer sus necesidades, su evaluación será altamente útil para medir el servicio y mejorar nuestros productos. Su opinión es valiosa para nosotros \"Muchas Gracias\".",
      "es": "\n"
    },
    "pages": [
      {
        "name": "Introducción",
        "elements": [
          {
            "type": "html",
            "name": "Intro",
            "html": {
              "es": "<p style=\"font-size: 1rem\">Estimado cliente: <br/> Nos esforzamos continuamente por conocer sus necesidades, su evaluación será altamente útil para medir el servicio y mejorar nuestros productos.<br/><br/> Su opinión es valiosa para nosotros <strong>\"Muchas Gracias\" </strong>.</p>"
            }
          }
        ],
        "title": {
          "default": "ENCUESTA DE SATISFACCION DEL CLIENTE",
          "es": "\n"
        }
      },
      {
        "name": "Pregunta 1",
        "elements": [
          {
            "type": "radiogroup",
            "name": "question1",
            "title": {
              "es": "¿Su material fue recibido en la fecha acordada?"
            },
            "isRequired": true,
            "hasComment": true,
            "commentText": {
              "es": "Comentario:"
            },
            "choices": [
              {
                "value": "Pésima",
                "text": {
                  "es": "Pésima"
                }
              },
              {
                "value": "Mala",
                "text": {
                  "es": "Mala"
                }
              },
              {
                "value": "Suficiente",
                "text": {
                  "es": "Suficiente"
                }
              },
              {
                "value": "Buena",
                "text": {
                  "es": "Buena"
                }
              },
              {
                "value": "Excelente",
                "text": {
                  "es": "Excelente"
                }
              }
            ]
          }
        ]
      },
      {
        "name": "Pregunta 2",
        "elements": [
          {
            "type": "radiogroup",
            "name": "question2",
            "title": {
              "es": "¿La calidad en la atención recibida fue?"
            },
            "isRequired": true,
            "hasComment": true,
            "commentText": {
              "es": "Comentario:"
            },
            "choices": [
              {
                "value": "Pésima",
                "text": {
                  "es": "Pésima"
                }
              },
              {
                "value": "Mala",
                "text": {
                  "es": "Mala"
                }
              },
              {
                "value": "Suficiente",
                "text": {
                  "es": "Suficiente"
                }
              },
              {
                "value": "Buena",
                "text": {
                  "es": "Buena"
                }
              },
              {
                "value": "Excelente",
                "text": {
                  "es": "Excelente"
                }
              }
            ]
          }
        ]
      },
      {
        "name": "Pregunta 3",
        "elements": [
          {
            "type": "radiogroup",
            "name": "question3",
            "title": {
              "es": "¿La calidad del material ha sido?"
            },
            "isRequired": true,
            "hasComment": true,
            "commentText": {
              "es": "Comentario:"
            },
            "choices": [
              {
                "value": "Pésima",
                "text": {
                  "es": "Pésima"
                }
              },
              {
                "value": "Mala",
                "text": {
                  "es": "Mala"
                }
              },
              {
                "value": "Suficiente",
                "text": {
                  "es": "Suficiente"
                }
              },
              {
                "value": "Buena",
                "text": {
                  "es": "Buena"
                }
              },
              {
                "value": "Excelente",
                "text": {
                  "es": "Excelente"
                }
              }
            ]
          }
        ]
      },
      {
        "name": "Pregunta 4",
        "elements": [
          {
            "type": "radiogroup",
            "name": "question4",
            "title": {
              "es": "¿El Costo / Beneficio que usted recibió fue?"
            },
            "isRequired": true,
            "hasComment": true,
            "commentText": {
              "es": "Comentario:"
            },
            "choices": [
              {
                "value": "Pésima",
                "text": {
                  "es": "Pésima"
                }
              },
              {
                "value": "Mala",
                "text": {
                  "es": "Mala"
                }
              },
              {
                "value": "Suficiente",
                "text": {
                  "es": "Suficiente"
                }
              },
              {
                "value": "Buena",
                "text": {
                  "es": "Buena"
                }
              },
              {
                "value": "Excelente",
                "text": {
                  "es": "Excelente"
                }
              }
            ]
          }
        ]
      },
      {
        "name": "Pregunta 5",
        "elements": [
          {
            "type": "boolean",
            "name": "question5",
            "title": {
              "es": "¿Las facturas están correctamente requisitadas?"
            },
            "isRequired": true,
            "labelTrue": {
              "es": "Si"
            },
            "showTitle": true,
            "valueTrue": "Si",
            "valueFalse": "No"
          },
          {
            "type": "text",
            "name": "question6",
            "title": {
              "es": "¿Porqué?"
            },
            "hideNumber": true,
            "requiredIf": "{question5} = 'No'",
            "validators": [
              {
                "type": "text",
                "text": {
                  "es": "Por favor escribe por lo menos 20 letras."
                },
                "minLength": 20
              }
            ]
          }
        ]
      },
      {
        "name": "Pregunta 6",
        "elements": [
          {
            "type": "boolean",
            "name": "question7",
            "title": {
              "es": "En general, ¿usted nos recomendaría?"
            },
            "isRequired": true,
            "labelTrue": {
              "es": "Si"
            },
            "valueTrue": "Si",
            "valueFalse": "No"
          },
          {
            "type": "text",
            "name": "question8",
            "title": {
              "es": "¿Porqué?"
            },
            "hideNumber": true,
            "requiredIf": "{question7} = 'No'",
            "validators": [
              {
                "type": "text",
                "text": {
                  "es": "Por favor entre por lo menos 20 símbolos."
                },
                "minLength": 20
              }
            ]
          }
        ]
      },
      {
        "name": "Pregunta 7",
        "elements": [
          {
            "type": "checkbox",
            "name": "question9",
            "title": {
              "es": "Para usted, Truemed significa:"
            },
            "isRequired": true,
            "choices": [
              {
                "value": "Precio",
                "text": {
                  "es": "a. Precio"
                }
              },
              {
                "value": "Calidad",
                "text": {
                  "es": "b. Calidad"
                }
              },
              {
                "value": "Servicio",
                "text": {
                  "es": "c. Servicio"
                }
              },
              {
                "value": "Tiempo de respuesta",
                "text": {
                  "es": "d. Tiempo de respuesta"
                }
              },
              {
                "value": "Proveedor alterno",
                "text": {
                  "es": "e. Proveedor alterno"
                }
              }
            ],
            "hasOther": true,
            "otherText": {
              "es": "Otro:"
            }
          }
        ]
      },
      {
        "name": "Firmas",
        "elements": [
          {
            "type": "signaturepad",
            "name": "firma",
            "width": 265,
            "title": {
              "es": "Firma:"
            },
            "hideNumber": true,
            "isRequired": true,
            "penColor": "#000000"
          },
          {
            "type": "file",
            "name": "Foto",
            "visible": false
          }
        ]
      }
    ],
    // "navigateToUrl": "/",
    "showProgressBar": "bottom",
    "firstPageIsStarted": true
  }
  constructor(private encuestasService: EncuestasService,
    private dexieService: DexieSolicitudesService,
    private router: Router) {
    this.clienteSeleccionado = {
      id: 0,
      nombre: ''
    };
    this.encuesta = {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: '',
      q6: '',
      q7: '',
      firma: new Blob()
    }
    this.innerWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.getCliente();
  }

  getCliente(): void {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Cargando'
    });
    Swal.showLoading();
    this.dexieService.getProveedores().then(proveedores => {
      let proveedor = proveedores.find((prov: any) => prov.id != 505);
      this.clientes = proveedor.clientes;
      this.provNombre = proveedor.nombre;
      this.clienteSeleccionado = this.clientes[0];
      this.clienteNombre = this.clienteSeleccionado.nombre;
      Swal.close();
    });
  }

  seleccionarCliente(e: any) {
    this.clienteSeleccionado = this.clientes[e.target.value];
    this.clienteNombre = this.clienteSeleccionado.nombre;
  }

  iniciarEncuesta() {
    if (this.clienteSeleccionado.id != 0) {
      this.banMostrarEncuesta = true;
    }
  }

  tomarFoto(): void {
    this.triggerSnapshot();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  movil(): boolean {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent))
      return true;

    return this.innerWidth < 768;
  }

  evidenciaTomada(e: WebcamImage): void {
    e.imageAsDataUrl;
    let blob = new Blob([this.dataURLtoBlob(e.imageAsDataUrl)], { type: "octet/stream" });
    this.fotoTomada = e.imageAsDataUrl;
    this.encuesta.evidencia = blob;
  }

  encuestaPorFinalizar(encuesta: any) {
    this.encuesta.q1 = encuesta.question1;
    encuesta['question1-Comment'] ? this.encuesta.c1 = encuesta['question1-Comment'] : '';
    this.encuesta.q2 = encuesta.question2;
    encuesta['question2-Comment'] ? this.encuesta.c2 = encuesta['question2-Comment'] : '';
    this.encuesta.q3 = encuesta.question3;
    encuesta['question3-Comment'] ? this.encuesta.c3 = encuesta['question3-Comment'] : '';
    this.encuesta.q4 = encuesta.question4;
    encuesta['question4-Comment'] ? this.encuesta.c4 = encuesta['question4-Comment'] : '';
    this.encuesta.q5 = encuesta.question5;
    encuesta.question6 ? this.encuesta.c5 = encuesta.question6 : '';
    this.encuesta.q6 = encuesta.question7;
    encuesta.question8 ? this.encuesta.c6 = encuesta.question8 : '';
    this.encuesta.q7 = encuesta.question9.toString();
    if (this.encuesta.q7.includes("other")) {
      this.encuesta.q7 = this.encuesta.q7.replace("other", encuesta['question9-Comment']);
    }
    this.fotoTomada = '';
    this.encuesta.firma = this.dataURLtoBlob(encuesta.firma);
    this.banEncuestaFinalizada = true;
  }

  enviarEncuesta(): void {
    Swal.fire({
      allowOutsideClick: false,
      text: 'Cargando'
    });
    Swal.showLoading();
    this.encuestasService.enviarEncuesta(this.encuesta, this.clienteSeleccionado.idCliente!).subscribe(res => {
      Swal.fire({
        allowOutsideClick: false,
        text: 'Encuesta enviada'
      }).then(ser => {
        if (ser.isConfirmed) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/']);
          });
        }
      });
    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
      });
    });
  }

  dataURLtoBlob(dataurl: string) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

}
