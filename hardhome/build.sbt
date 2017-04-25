import com.typesafe.sbt.SbtScalariform._
import PlayGulp._
import scalariform.formatter.preferences._
import com.typesafe.sbt.packager.archetypes.ServerLoader

name := "vetafi-web"

version := "4.0.0"

scalaVersion := "2.11.8"

maintainer in Linux := "Jeff Quinn jeff@vetafi.org"

packageSummary in Linux := "Vetafi.org web application."

serverLoading in Debian := ServerLoader.Systemd

unmanagedClasspath in Runtime += baseDirectory.value / "conf"

resolvers += Resolver.jcenterRepo
resolvers += Resolver.url("Typesafe Ivy releases", url("https://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns)
resolvers += "jitpack" at "https://jitpack.io" // Used to resolve com.github.* projects

libraryDependencies ++= Seq(
  "org.reactivemongo" %% "play2-reactivemongo" % "0.12.1",
  "com.mohiva" %% "play-silhouette" % "4.0.0",
  "com.mohiva" %% "play-silhouette-password-bcrypt" % "4.0.0",
  "com.mohiva" %% "play-silhouette-persistence" % "4.0.0",
  "com.mohiva" %% "play-silhouette-crypto-jca" % "4.0.0",
  "com.mohiva" %% "play-silhouette-persistence-reactivemongo" % "4.0.1",
  "net.codingwell" %% "scala-guice" % "4.0.1",
  "com.iheart" %% "ficus" % "1.2.6",
  "com.typesafe.play" %% "play-mailer" % "5.0.0",
  "com.enragedginger" %% "akka-quartz-scheduler" % "1.5.0-akka-2.4.x",
  "com.mohiva" %% "play-silhouette-testkit" % "4.0.0" % "test",
  "com.digitaltangible" %% "play-guard" % "2.0.0",
  "com.github.dcoker" % "biscuit-java" % "ebed4b3a238a45c007da138175f1132a6bf26b71",
  specs2 % Test,
  cache,
  filters
)

lazy val root = (project in file("."))
    .enablePlugins(PlayScala, DebianPlugin)
    .settings(playGulpSettings)

routesGenerator := InjectedRoutesGenerator

routesImport += "utils.route.Binders._"

//********************************************************
// Scalariform settings
//********************************************************

defaultScalariformSettings

ScalariformKeys.preferences := ScalariformKeys.preferences.value
  .setPreference(FormatXml, false)
  .setPreference(DoubleIndentClassDeclaration, false)
  .setPreference(PreserveDanglingCloseParenthesis, true)


// play-gulp settings
unmanagedResourceDirectories in Assets <+= (gulpDirectory in Compile)(base => base / "build")

fork in run := false

javaOptions in Universal ++= Seq(
  "-J-Xmx4000m",
  "-J-Xms512m",
  s"-Dpidfile.path=/var/run/${packageName.value}/play.pid",
  // Use separate configuration file for production environment
  s"-Dconfig.file=/usr/share/${packageName.value}/conf/application.prod.conf"
)
