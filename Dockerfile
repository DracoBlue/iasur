FROM node:8.1.3
ADD . /opt/iasur
EXPOSE 80
WORKDIR /usr/src/app
RUN cd /opt/iasur && npm link
ENTRYPOINT ["iasur"]
CMD ["serve", "/"]