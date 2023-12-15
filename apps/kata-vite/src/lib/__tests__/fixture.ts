import { JiraTask } from '@/types/jira-task'

export const fixture: JiraTask = {
  fields: {
    comment: {
      comments: [
        {
          body: {
            content: [
              {
                type: 'heading',
                content: [{ type: 'text', text: 'Tareas' }]
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Estudiar documentación de COAM → 4'
                          }
                        ]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Modificar descripcion del provider'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Registrar templates en mailer → 2'
                          }
                        ]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'BOOKING_CREATED_COAM'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [{ type: 'text', text: 'RECOVERY_PASS_COAM' }]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Queries para asociar nuevos templates a COAM'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Modificar enum de personalIdType → 1'
                          }
                        ]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Añadir licenseNumber'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Modificar search de person → 2'
                          }
                        ]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Añadir en person-store::search la búsqueda por personalId y personalIdType'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Crear endpoint de login coam → 3'
                          }
                        ]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [{ type: 'text', text: 'Method POST' }]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'url /api/v1/login/coam'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Recibe body con licenseNumber y password'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Llama al caso de uso AuthCoamLogin'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [{ type: 'text', text: 'Devuelve un person' }]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Usa el middleware que crea la session ('
                                  },
                                  {
                                    type: 'text',
                                    text: 'createSessionHandler'
                                  },
                                  { type: 'text', text: ')' }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Crear caso de uso AuthCoamLogin → 5'
                          }
                        ]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Colaboradores: person-creator, person-store | person-searcher, team-store y CoamProvider'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Recibe licenseNumber y password'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Llama al provider de coam para hacer login'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: "Si la respuesta es OK → buscar usuario por personalId = licenseNumber y personalIdType = ‘licenseNumber' → si existe lo devolvemos → si no existe guarda el person con email <licenseNumber>@zityhub.com , name unknown, personalId = <licenseNumber>, personalIdType = 'licenseNumber', company  = 189, team = 927, createdBy = 'coam’ y lo devuelve"
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Si la respuesta es KO → levantamos excepción InvalidRequest'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Crear provider de COAM → 3' }]
                      },
                      {
                        type: 'bulletList',
                        content: [
                          {
                            type: 'listItem',
                            content: [
                              {
                                type: 'paragraph',
                                content: [
                                  {
                                    type: 'text',
                                    text: 'Descripción pendiente del spike'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'TOTAL: 16pts + 4h' }]
              }
            ]
          }
        }
      ]
    }
  }
}
