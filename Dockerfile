FROM debian:jessie
MAINTAINER Chris Hagan<chris@stackableregiments.com>

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y yaws
EXPOSE 80

CMD ["yaws","--debug","--conf","/srv/yaws/conf/yaws.conf"]
