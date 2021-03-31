# © Copyright EnterpriseDB UK Limited 2015-2021 - All rights reserved.

FROM debian:buster

MAINTAINER 2ndQuadrant <info@2ndQuadrant.com>

# Set up repositories and install packages, including the Docker CE CLI
# (https://docs.docker.com/engine/install/debian/).

RUN apt-get -y update && \
    apt-get -y install curl gnupg software-properties-common \
        python3.7 python3-pip python3-venv pwgen openvpn patch git && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian buster stable" && \
    apt-get -y update && apt-get -y install docker-ce-cli

# Copy tpaexec sources from the current directory into the image, and
# run `tpaexec setup` to complete the installation, and then `tpaexec
# selftest` to verify it.

ENV TPA_DIR=/opt/EDB/TPA

COPY . ${TPA_DIR}

RUN ln -sf ${TPA_DIR}/bin/tpaexec /usr/local/bin && \
    ln -sf ${TPA_DIR} /opt/2ndQuadrant/TPA && \
    tpaexec setup && tpaexec selftest
