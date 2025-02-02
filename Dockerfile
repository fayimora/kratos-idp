FROM oryd/kratos:v1.2.0

ARG KRATOS_CONFIG_PATH

COPY entrypoint.sh /entrypoint.sh
COPY ${KRATOS_CONFIG_PATH} /etc/config/kratos/
# COPY ${KRATOS_CONFIG_PATH} /etc/config/kratos/kratos.yml
# COPY ${KRATOS_CONFIG_PATH}/identity.schema.json /etc/config/kratos/identity.schema.json
# CMD ["serve", "-c", "/home/ory/kratos.yml"]

ENTRYPOINT ["/entrypoint.sh"]
